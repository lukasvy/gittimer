const expect = require('chai').expect;
const {sandbox, clock, keyboard} = require('~/test/TestHelper').utils;
const {ListSearchService} = require('~/src/services/ListSearchService');

describe('List search service test', () => {
    it('Should process keyboard events', () => {
        keyboard({key:'t'});
        keyboard({key:'e'});
        keyboard({key:'s'});
        keyboard({key:'t'});
        expect(ListSearchService.getText()).to.equal('test');
        ListSearchService.clear();
    });
    it('Should ignore weird characters', () => {
        keyboard({key:'t'});
        keyboard({key:'e'});
        keyboard({key:'+'});
        keyboard({key:'?'});
        keyboard({key:'s'});
        keyboard({key:'*'});
        keyboard({key:'t'});
        expect(ListSearchService.getText()).to.equal('test');
        ListSearchService.clear();
        expect(ListSearchService.getText()).to.equal('');
    });
    it('Should call subsccriptions on clear and change',() => {
        const spy1 = sandbox.spy();
        const sub = ListSearchService.onChange(spy1);
        keyboard({key:'t'});
        keyboard({key:'e'});
        expect(spy1.callCount).to.equal(2);
        ListSearchService.clear();
        expect(spy1.callCount).to.equal(3);
        sub();
    });
    it('Should call onclearfinished after pressing esc twice', () => {
        const spy1 = sandbox.spy();
        const sub = ListSearchService.onClearFinished(spy1);
        keyboard({key:'t'});
        keyboard({key:'e'});
        expect(spy1.callCount).to.equal(0);
        keyboard({key:'Escape'});
        expect(spy1.callCount).to.equal(0);
        keyboard({key:'Escape'});
        expect(spy1.callCount).to.equal(1);
        sub();
    })
});