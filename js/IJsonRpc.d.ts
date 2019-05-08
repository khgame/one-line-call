export declare interface IJsonRpc {
    jsonrpc: '2.0';
    method: string;
    params?: any[];
    id?: number;
}
