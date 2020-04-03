# node-ssh-Forward

Another easy simple ssh lib for forwarding ports, command execution and interactive shell support.

Has in-built support for bastion hosts (also known as jump hosts).

* [Installation](#installation)
* [Usage](#usage)
* [API](#api)




## <a name="installation">Installation</a>

```sh
$ npm install node-ssh-forward
```
or

```sh
$ yarn add node-ssh-forward
```

## <a name="usage">Usage</a>

Setting up the initial ssh connection (using a bastion host)

```js
import { SSHConnection } from 'node-ssh-forward'

const sshConnection = new SSHConnection({
  endHost: 'example.com',
  bastionHost: 'my-bastion-host.com'
})
```

#### Port forwarding

```sh
$ ssh -L 9000:imgur.com:80 example.com
```

```js
const sshConnection = new SSHConnection({
  endHost: 'example.com',
})
await sshConnection.forward({
  fromPort: 9000,
  toPort: 80,
  toHost: 'imgur.com'
})
```

#### Port forwarding and using a bastion/jump host

```sh
$ ssh -L 9000:localhost:80 -J your-jump-host.com example.com
```

```js
const sshConnection = new SSHConnection({
  endHost: 'example.com',
  bastionHost: 'your-jump-host.com'
})
await sshConnection.forward({
  fromPort: 9000,
  toPort: 80,
})
```

#### Executing a command on the remote server

```js
const sshConnection = new SSHConnection({
  endHost: 'example.com',
  bastionHost: 'your-jump-host.com'
})
await sshConnection.executeCommand('uptime')
```

## <a name="api">API</a>

#### `new SSHConnection(options)`

Options are an object with following properties: 

* `username` (optional): The username used for your ssh connection (equivalent to `-l` option). If not set, it first looks for an `SSH_USERNAME` environment variable. If that is not set, it fallbacks to `USER` environment variable.
* `privateKey` (optional): Can be a `string` or `Buffer` that contains a private key. If not set, it fallbacks to `~/.ssh/id_rsa`
* `agentForward` (optional): Is a `boolean` which uses the `ssh-agent` for connection (defaults to `false`.
* `endHost` (required): The host you want to end up on (connect to)
* `endPort` (optional): Port number of the server. Needed in case the server runs on a custom port (defaults to `22`)
* `bastionHost` (optional): You can specify a bastion host if you want
* `passphrase` (optional): You can specify the passphrase when you have an encrypted private key. If you don't specify the passphrase and you use an encrypted private key, you get prompted in the command line. 

#### `connection.executeCommand(command: string): Promise<void>`

Executes a command on the server. Promise will resolve after the command has been executed.

#### `connection.tty(): Promise<void>`

Starts an interactive shell session. Will resolve when then client has logged out from the server.

#### `connection.forward(forwardOptions: Object)`

Established port-forwarding. Promise resolves after the forwarding has been established. Forwarding can be stopped by calling `connection.shutdown()`

Possible options for `forwardOptions`:

* `fromPort` (required): Specifies the port on your local computer
* `toPort` (required): The port on `endHost` (specified in the SSHConnection options).
* `toHost` (optional): You can specify an additional `toHost` when you want to forward a port from a different server than your `endHost`.

#### `connection.shutdown()`

Closes all connections.

## Developing

* Add your wanted feature to the implementation in `./src`
* Add test in `./test/test.ts`
* Run the test with `./test/test.sh`

## Limitations/Todos

* only works with username , private key and ssh agent
* host based authentication
* Better documentation
* Debug logging
* Ability to pass an additional string to the `forward` that specifies when the promise is resolved and the forwarding is stopped



