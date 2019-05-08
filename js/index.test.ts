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

    it('serialize (only func name)', function (done) {
        const call = OneLineCall.parse('@[get]');
        assert.equal(call.serialize(), '@[get]');
        done();
    });

    it('serialize (one empty arg)', function (done) {
        const call = OneLineCall.parse('@[get:1]');
        assert.equal(call.serialize(), '@[get:1]');
        done();
    });

    it('serialize (don not trim)', function (done) {
        const call = OneLineCall.parse('@[get: 1]');
        assert.equal(call.serialize(), '@[get: 1]');
        done();
    });

    it('serialize (with comma)', function (done) {
        const call = new OneLineCall('get', '1,');
        assert.throw(()=>call.serialize());
        done();
    });

    it('serialize (object)', function (done) {
        const call = new OneLineCall('get', {a: 1, b: 2} );
        assert.throw(()=> call.serialize());
        done();
    });

    it('toJsonRPC', function (done) {
        const call = new OneLineCall('get', '1', 2, {a:3});
        assert.deepEqual(call.toJsonRpc(996), {
            jsonrpc: '2.0',
            method: 'get',
            params: ['1', 2, {a:3}],
            id: 996
        })
        done();
    });

});

