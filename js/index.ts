'use strict';
import {IJsonRpc} from './IJsonRpc';

export class OneLineCall {

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

    public fromJsonRpc(data : IJsonRpc) {
        this.func = data.method;
        this.args = data.params || [];
        return this;
    }

    public toJsonRpc(id: number = 0): IJsonRpc {
        return {
            jsonrpc: '2.0',
            method: this.func,
            params: this.args,
            id: id
        }
    }

    public serializeToJsonRpc(id: number = 0): string {
        const jsonData = this.toJsonRpc(id);
        return JSON.stringify(jsonData);
    }

    /**
     * Parse raw sentences
     */
    public parse(input: string) {
        const callType = input[0];
        if (input.length < 4) throw new Error('parse transcal error: the input is too short.');
        if (input[1] !== '[' || input[2] === ']') throw new Error('parse transcal error: formation error.');
        if (callType !== '@' && callType !== '#') throw new Error('parse transcal error: type mark must be @ or #.');

        const posCol = input.indexOf(':');
        const posEnd = input.lastIndexOf(']');
        if (posEnd < 0) throw new Error('parse transcal error: cannot find end mark \']\'.');

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

    public static parse(input: string) {
        return (new OneLineCall('')).parse(input);
    }

    public static parseFromJson(input: IJsonRpc) {
        return (new OneLineCall('')).fromJsonRpc(input);
    }

}
