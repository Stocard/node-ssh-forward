
/*
 * Copyright 2018 Stocard GmbH.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Client } from 'ssh2'
import * as net from 'net'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import *  as readline from 'readline'

interface Options {
  username?: string
  privateKey?: string | Buffer
  agentForward? : boolean
  bastionHost?: string
  passphrase?: string
  endPort?: number
  endHost: string
}

interface ForwardingOptions {
  fromPort: number
  toPort: number
  toHost?: string
}

class SSHConnection {

  private server
  private connections: Client[] = []

  constructor(private options: Options) {
    if (!options.username) {
      this.options.username = process.env['SSH_USERNAME'] || process.env['USER']
    }
    if (!options.endPort) {
      this.options.endPort = 22
    }
    if (!options.privateKey) {
      this.options.privateKey = fs.readFileSync(`${os.homedir()}${path.sep}.ssh${path.sep}id_rsa`)
    }
  }

  public async shutdown() {
    for (const connection of this.connections) {
      connection.removeAllListeners()
      connection.end()
    }
    return new Promise<void>((resolve) => {
      if (this.server) {
        this.server.close(resolve)
      }
      return resolve()
    })
  }

  public async tty() {
    const connection = await this.establish()
    await this.shell(connection)
  }

  public async executeCommand(command) {
    const connection = await this.establish()
    await this.shell(connection, command)
  }

  private async shell(connection: Client, command?: string) {
    return new Promise((resolve, reject) => {
      connection.shell((err, stream) => {
        if (err) {
          return reject(err)
        }
        stream.on('close', async () => {
          stream.end()
          process.stdin.unpipe(stream)
          process.stdin.destroy()
          connection.end()
          await this.shutdown()
          return resolve()
        }).stderr.on('data', (data) => {
          return reject(data)
        })
        stream.pipe(process.stdout)

        if (command) {
          stream.end(`${command}\nexit\n`)
        } else {
          process.stdin.pipe(stream)
        }
      })
    })
  }

  private async establish() {
    let connection: Client
    if (this.options.bastionHost) {
      connection = await this.connectViaBastion(this.options.bastionHost)
    } else {
      connection = await this.connect(this.options.endHost)
    }
    return connection
  }

  private async connectViaBastion(bastionHost: string) {
    const connectionToBastion = await this.connect(bastionHost)
    return new Promise<Client>((resolve, reject) => {
      connectionToBastion.exec(`nc ${this.options.endHost} ${this.options.endPort}`, async (err, stream) => {
        if (err) {
          return reject(err)
        }
        const connection = await this.connect(this.options.endHost, stream)
        return resolve(connection)
      })
    })
  }

  private async connect(host: string, stream?: NodeJS.ReadableStream): Promise<Client> {
    const connection = new Client()
    return new Promise<Client>(async (resolve) => {
      const options = {
        host,
        port: this.options.endPort,
        username: this.options.username,
        privateKey: this.options.privateKey
      }
      if (this.options.agentForward) {
        options['agentForward'] = true
        // guaranteed to give the ssh agent sock if the agent is running
        const agentSock = process.env['SSH_AUTH_SOCK']
        if (agentSock === undefined) {
          throw new Error('SSH Agent is not running and not set in the SSH_AUTH_SOCK env variable')
        }
        options['agent'] = agentSock
      }
      if (stream) {
        options['sock'] = stream
      }
      if (options.privateKey && options.privateKey.toString().toLowerCase().includes('encrypted')) {
        options['passphrase'] = (this.options.passphrase) ? this.options.passphrase : await this.getPassphrase()
      }
      connection.connect(options)
      connection.on('ready', () => {
        this.connections.push(connection)
        return resolve(connection)
      })
    })
  }

  private async getPassphrase() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('Please type in the passphrase for your private key: ', (answer) => {
        return resolve(answer)
      })
    })
  }

  async forward(options: ForwardingOptions) {
    const connection = await this.establish()
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        connection.forwardOut('localhost', options.fromPort, options.toHost || 'localhost', options.toPort, (error, stream) => {
          if (error) {
            return reject(error)
          }
          socket.pipe(stream)
          stream.pipe(socket)
        })
      }).listen(options.fromPort, 'localhost', () => {
        return resolve()
      })
    })
  }
}

export { SSHConnection, Options }
