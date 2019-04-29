import {assert} from 'chai';
import {OneLineCall} from './index';

describe(`one-line-call test`, async function () {

    it('parse (normal)', function (done) {
        const call = OneLineCall.parse('@[get:1,ok,3.2]');
        assert.equal(call.func, 'get');
        assert.equal(call.args.length, 3);
        assert.equal(call.args[0], '1');
        assert.equal(call.args[1], 'ok');
        assert.equal(call.args[2], '3.2');
        done();
    });

    it('parse (with empty str)', function (done) {
        const call = OneLineCall.parse('@[get:1,ok,, ]');
        assert.equal(call.func, 'get');
        assert.equal(call.args.length, 4);
        assert.equal(call.args[0], '1');
        assert.equal(call.args[1], 'ok');
        assert.equal(call.args[2], '');
        assert.equal(call.args[3], ' ');
        done();
    });

    it('parse (only func name)', function (done) {
        const call = OneLineCall.parse('@[get]');
        assert.equal(call.func, 'get');
        assert.equal(call.args.length, 0);
        done();
    });

    it('parse (one empty arg)', function (done) {
        const call = OneLineCall.parse('@[get:]');
        assert.equal(call.func, 'get');
        assert.equal(call.args.length, 1);
        assert.equal(call.args[0], '');
        done();
    });

});

