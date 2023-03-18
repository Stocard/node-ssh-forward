import { SSHConnection } from '../dist/Connection'
import *  as fs from 'fs'

describe('node-ssh-forward', async () => {
  describe('Connect to a server', async () => {
    it('with default path to the private key', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server'
      })
      await ssh.executeCommand('uptime')
    })
    it.skip('with default path to the private key and ssh agent enabled ', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        agentForward: true
      })
      await ssh.executeCommand('uptime')
    })
    it('with custom path to the private key', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        privateKey: fs.readFileSync(`${__dirname}/keys/id_rsa_no_pass`),
      })
      await ssh.executeCommand('uptime')
    })
    it('with a passphrase protected private key', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        privateKey: fs.readFileSync(`${__dirname}/keys/id_rsa_pass`),
        passphrase: 'passphrase'
      })
      await ssh.executeCommand('uptime')
    })
    it('with the new openssh key format', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        privateKey: fs.readFileSync(`${__dirname}/keys/id_openssh`),
      })
      await ssh.executeCommand('uptime')
    })
    it('with a custom end port', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server-different-port',
        endPort: 23
      })
      await ssh.executeCommand('uptime')
    })
  })
  describe('Connect to a server via a bastion host', () => {
    it('with default path to the private key', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        bastionHost: 'bastion'
      })
      await ssh.executeCommand('uptime')
    })
    it('with root as bastion user and default path to the private key', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        bastionHost: 'bastion',
        bastionUsername: 'root'
      })
      await ssh.executeCommand('uptime')
    })
    it('with bastionUser as bastion user and default path to the private key', async () => {
      const ssh = new SSHConnection({
        username: 'root',
        endHost: 'server',
        bastionHost: 'bastion-different-user',
        bastionUsername: 'bastionUser'
      })
      await ssh.executeCommand('uptime')
    })
  })
})
