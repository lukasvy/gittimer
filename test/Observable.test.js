const expect = require('chai').expect;
const {sandbox, clock} = require('~/test/TestHelper').utils;
describe('Testing Observable service ', () => {
    it('Should run subscriptions when subscribed in proper order', () => {
        const {Subscription} = require("~/src/services/Observable");
        const stub1 = sandbox.stub().returns(true);
        const stub2 = sandbox.stub().returns(true);
        const stub3 = sandbox.stub().returns(true);
        const {subscribe, trigger} = Subscription();
        const sub1 = subscribe(stub1);
        subscribe(stub2);
        trigger();
        expect(stub1.calledOnce, 'call subscription 1 once').to.equal(true);
        expect(stub1.calledBefore(stub2), 'subscription 1 should be called before subscription 2').to.equal(true);
        expect(stub2.calledOnce, 'call subscription 2 once').to.equal(true);
        subscribe(stub3);
        new Array(10).fill(1).forEach(trigger);
        expect(stub1.callCount, 'call count after 11 iterations should be [answer]').to.equal(11);
        expect(stub3.callCount, 'call count after 10 iterations should be [answer]').to.equal(10);
        sub1();
        trigger();
        expect(stub1.callCount, 'removed subscription should not receive more triggers ').to.equal(11);
    });
    it('Subscription should get proper arguments', () => {
        const {Subscription} = require("~/src/services/Observable");
        const stub1 = sandbox.stub().returns(true);
        const {subscribe, trigger} = Subscription();
        subscribe(stub1);
        trigger(1, 2, 3);
        expect(stub1.calledOnceWith(1, 2, 3)).to.equal(true);
    });
});