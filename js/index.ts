'use strict';

import {IJsonRpcNotification, IJsonRpcRequest} from '@khgame/jsonrpc/lib';

export interface IOneLineCall {
    func: string;
    args: any[];
}

export class OneLineCall implements IOneLineCall {

    public args: any[] = [];

    public get chain(): string[] {
        return this.func.split('.');
    }

    public chainLeaf(target: any) {
        const chain = this.chain;

        if (!target) {
            throw new Error(`one-line-call chain target are not exist`);
        }

        for (const i in chain) {
            const key: string = chain[i];
            if (!target[key]) {
                throw new Error(`one-line-call chaim broken at ${key}, for ${this.func}`);
            }
            if (target[key] instanceof Function) {
                target = (target[key] as Function).bind(target);
            } else {
                target = target[key]
            }
        }
        return target;
    }

    constructor(public func: string, ...args: any[]) {
        this.args = args;
    }

    /**
     * Serialize to raw sentences
     * @return {string}
     */
    public serialize() {
        if (this.args.length <= 0) {
            return `@[${this.func}]`
        }
        let result = `@[${this.func}:`;
        for (let i = 0; i < this.args.length; i++) {
            let c: any = this.args[i];

            if (typeof c === 'object') {
                throw new Error('serialize error: object are not supported');
            } else if (typeof c !== 'string') {
                c = `${c}`
            }

            if (c.indexOf(',') >= 0) {
                throw new Error('serialize error: symbol "," cannot exist in the serialized argument');
            }

            result += c;
            if (i !== this.args.length - 1) {
                result += ',';
            } else {
                result += ']';
            }
        }
        return result;
    }

    public serializeAsJsonRpc(id: number = 0): string {
        const jsonData = this.asJsonRpc(id);
        return JSON.stringify(jsonData);
    }

    public asJsonRpc(id: number = Date.now()): IJsonRpcRequest {
        return {
            jsonrpc: '2.0',
            method: this.func,
            params: this.args,
            id: id
        }
    }

    /**
     * Parse raw sentences
     */
    public parse(input: string) {
        const callType = input[0];
        if (input.length < 4) throw new Error('parse one-line-call string error: the input is too short.');
        if (input[1] !== '[' || input[2] === ']') throw new Error('parse one-line-call string error: formation error.');
        if (callType !== '@' && callType !== '#') throw new Error('parse one-line-call string error: type mark must be @ or #.');

        const posCol = input.indexOf(':');
        const posEnd = input.lastIndexOf(']');
        if (posEnd < 0) throw new Error('parse one-line-call  string error: cannot find end mark \']\'.');

        if (posCol < 0) { // if the col mark exist
            this.func = input.substr(2, posEnd - 2);
            this.args = [];
            return this;
        }

        this.func = input.substr(2, posCol - 2);

        let pos = posCol + 1;
        let posPrev = pos;
        const args = [];
        while (true) {
            pos = input.indexOf(',', pos);
            if (pos >= posEnd || pos < 0) {
                args.push(input.substr(posPrev, posEnd - posPrev));
                break;
            }
            args.push(input.substr(posPrev, pos - posPrev));
            posPrev = ++pos;
        }
        this.args = args;
        return this;
    }

    public parseFromJson(data: any) {
        if (data.jsonrpc === '2.0') {
            const {method, params} = data as IJsonRpcNotification;
            this.func = method;
            this.args = params || [];
        } else if (data.func) {
            const {func, args} = data as IOneLineCall;
            this.func = func;
            this.args = args;
        } else {
            throw new Error('json input format error');
        }
        return this;
    }

    public static parse(input: string) {
        return (new OneLineCall('')).parse(input);
    }

    public static parseFromJson(input: any) {
        if (!input) {
            throw new Error('input cannot be empty');
        }
        return (new OneLineCall('')).parseFromJson(input as IJsonRpcNotification);
    }
}
