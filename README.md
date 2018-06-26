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
$ yarn install node-ssh-forward
```

## <a name="usage">Usage</a>

Setting up the initial ssh connection (using a bastion host)

```js
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
* `endHost` (required): The host you want to end up on (connect to)
* `bastionHost` (optional): You can specify a bastion host if you want
* `portForwarding` (required): 

#### `connection.executeCommand(command: string): Promise<void>`

Executes a command on the server. Promise will resolve after the command has been executed.

#### `connection.tty(): Promise<void>`

Starts an interactive shell session. Will resolve when then client has logged out from the server.

#### `connection.forward(forwardOptions: Object)`

Established port-forwarding.

Possible options for `forwardOptions`:

* `fromPort` (required): Specifies the port on your local computer
* `toPort` (required): The port on `endHost` (specified in the SSHConnection options).
* `toHost` (optional): You can specify an additional `toHost` when you want to forward a port from a different server than your `endHost`.


## Limitations/Todos

* only works with username and private key
* does not use your local ssh-agent
* No tests
* Better documentation
* Debug logging
* Ability to pass an additional string to the `forward` that specifies when the promise is resolved and the forwarding is stopped



