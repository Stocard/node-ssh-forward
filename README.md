# node-ssh-Forward

Another easy simple ssh forwarding lib.

In-built support for bastion hosts (also known as jump hosts)

## Installation

```sh
$ npm install node-ssh-forward
```

## Usage

#### Port forwarding

```sh
$ ssh -L 9000:imgur.com:80 example.com
```

```js
const sshConnection = new SSHConnection({
  username: 'yourSshUsername',
  privateKey: fs.readFileSync(`${os.homedir()}/.ssh/id_rsa`),
  endHost: 'example.com',
  portForwarding: {
    fromPort: 80,
    toPort: 9000,
    toHost: 'imgur.com'
  }
})
await sshConnection.establish()
```

#### Port forwarding and using a bastion/jump host

```sh
$ ssh -L 9000:localhost:80 -J your-jump-host.com example.com
```

```js
const sshConnection = new SSHConnection({
  username: 'yourSshUsername',
  privateKey: fs.readFileSync(`${os.homedir()}/.ssh/id_rsa`),
  endHost: 'example.com',
  bastionHost: 'your-jump-host.com',
  portForwarding: {
    fromPort: 80,
    toPort: 9000,
    toHost: 'localhost'
  }
})
await sshConnection.establish()
```

## API

#### `new SSHConnection(options)`

Options are an object with following properties: 

* `username` (optional): The username used for your ssh connection (equivalent to `-l` option). If not set, it first looks for an `SSH_USERNAME` environment variable. If that is not set, it fallbacks to `USER` environment variable.
* `privateKey` (required): Can be a `string` or `Buffer``
* `endHost` (required): The host you want to end up on (connect to)
* `bastionHost` (optional): You can specify a bastion host if you want
* `portForwarding` (required): `fromPort` specifies the port on your local computer, `toPort` the port on `toHost`. When `endHost` is able to reach `toHost` it can establish a port forwarding (see example above). If you want to have port forwarding from a port on `endHost`, your `toHost` value must be `localhost`

#### `connection.establish()`

Establishes the connection.

#### `connection.shutdown()`

Shuts down all open connections and servers.

## Limitations/Todos

* only works with username and private key
* does not use your local ssh-agent
* No tests
* Better documentation
* Debug logging



