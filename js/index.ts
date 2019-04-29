'use strict';

export class OneLineCall {

    public args: string[] = [];

    constructor(public func: string, ...args: string[]) {
        this.args = args;
    }

    /**
     * Serialize to raw sentences
     * @return {string}
     */
    public serialize() {
        return `@[${this.func}:${this.args.join(',')}]`;
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
        const posEnd = input.indexOf(']');
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
}
