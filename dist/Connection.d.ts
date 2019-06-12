/// <reference types="node" />
interface Options {
    username?: string;
    privateKey?: string | Buffer;
    agentForward?: boolean;
    bastionHost?: string;
    passphrase?: string;
    endPort?: number;
    endHost: string;
}
interface ForwardingOptions {
    fromPort: number;
    toPort: number;
    toHost?: string;
}
declare class SSHConnection {
    private options;
    private server;
    private connections;
    constructor(options: Options);
    shutdown(): Promise<void>;
    tty(): Promise<void>;
    executeCommand(command: any): Promise<void>;
    private shell;
    private establish;
    private connectViaBastion;
    private connect;
    private getPassphrase;
    forward(options: ForwardingOptions): Promise<unknown>;
}
export { SSHConnection, Options };
