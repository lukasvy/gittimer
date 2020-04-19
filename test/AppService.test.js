const assert = require('chai').assert;
const expect = require('chai').expect;
const {sandbox} = require('~/test/TestHelper').utils;

describe('Testing App Service ', () => {
    it('App service should start Ticker', () => {
        const {AppService} = require('~/src/services/AppService');
        const {TickerService} = require('~/src/services/TickerService');
        sandbox.spy(TickerService);
        AppService.start({});
        assert(TickerService.start.calledOnce);
    });
    it('App service should stop Ticker on stopping app', () => {
        const {AppService} = require('~/src/services/AppService');
        const {TickerService} = require('~/src/services/TickerService');
        sandbox.spy(TickerService);
        AppService.start({});
        AppService.stop();
        assert(TickerService.pause.calledOnce);
        AppService.start({});
        assert(TickerService.start.calledTwice);
    });
    it('Should run subscriptions before it finishes hiding window', ()=>{
        const {AppService} = require('~/src/services/AppService');
        const {DialogService} = require('~/src/services/DialogService');
        DialogService.isOpened = sandbox.stub().returns(false);
        const spy = sandbox.stub().returns(Promise.resolve());
        AppService.onBeforeHide(spy);
        const spy1 = sandbox.spy();
        AppService.start({
                             hide: spy1
                         });
        AppService.hide();
        expect(spy.called, 'Subscription was not called').to.be.equal(true);
    });
    it('Should not hide window when dialog is opened', () => {
        const {AppService} = require('~/src/services/AppService');
        const {DialogService} = require('~/src/services/DialogService');
        DialogService.isOpened = sandbox.stub().returns(true);
        const spy1 = sandbox.spy();
        AppService.start({
            hide: spy1
        });
        AppService.hide();
        expect(!spy1.called).to.be.equal(true);
    });
});