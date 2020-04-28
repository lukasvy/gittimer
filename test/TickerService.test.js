const assert = require('chai').assert;
const expect = require('chai').expect;
const {sandbox, clock} = require('~/test/TestHelper').utils;

describe('Ticker service should work as expected',() => {

    it('Should run subscribers every tick (second)', () => {
        const {TickerService} = require("~/src/services/TickerService");
        const spy = sandbox.spy();
        TickerService.subscribeToTick(spy);
        clock.tick(1000 * 60);
        expect(spy.callCount).to.equal(60);
    });
    it('Should not tick when paused', ()=>{
        const {TickerService} = require("~/src/services/TickerService");
        const spy = sandbox.spy();
        TickerService.subscribeToTick(spy);
        TickerService.pause();
        clock.tick(1000 * 60);
        expect(spy.callCount).to.equal(0);
    });
});