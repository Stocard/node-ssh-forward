
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

interface Options {
  username?: string
  privateKey: string | Buffer
  bastionHost?: string
  endHost: string
  portForwarding: {
    fromPort: number
    toPort: number
    toHost: string
  }
}

class SSHConnection {

  private server
  private connections: Client[] = []

  constructor(private options: Options) {
    if (!options.username) {
      this.options.username = process.env['SSH_USERNAME'] || process.env['USER']
    }
  }

  public async shutdown() {
    for (const connection of this.connections) {
      connection.removeAllListeners()
      connection.end()
    }
    return new Promise<void>((resolve) => {
      this.server.close(resolve)
    })
  }

  public async establish() {
    if (this.options.bastionHost) {
      const finalConnection = await this.connectViaBastion(this.options.bastionHost)
      await this.createForwarding(finalConnection)
    } else {
      const connection1 = await this.connect(this.options.endHost)
      await this.createForwarding(connection1)
    }
    return
  }

  private async connectViaBastion(bastionHost: string) {
    const connectionToBastion = await this.connect(bastionHost)
    return new Promise<Client>((resolve, reject) => {
      connectionToBastion.exec(`nc ${this.options.endHost} 22`, async (err, stream) => {
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
    return new Promise<Client>((resolve) => {
      const options = {
        host,
        username: this.options.username,
        privateKey: this.options.privateKey
      }
      if (stream) {
        options['sock'] = stream
      }
      connection.connect(options)
      connection.on('ready', () => {
        this.connections.push(connection)
        return resolve(connection)
      })
    })
  }

  private async createForwarding(connection: Client) {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        connection.forwardOut('localhost', this.options.portForwarding.fromPort, this.options.portForwarding.toHost, this.options.portForwarding.toPort, (error, stream) => {
          if (error) {
            console.log('error', error)
            return reject(error)
          }
          socket.pipe(stream)
          stream.pipe(socket)
        })
      }).listen(this.options.portForwarding.fromPort, 'localhost', () => {
        return resolve()
      })
    })
  }
}

export { SSHConnection, Options }
