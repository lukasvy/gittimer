import {Branch} from "~/src/models/Branch";
import * as moment from 'moment';
const expect = require('chai').expect;
const {sandbox, clock} = require('~/test/TestHelper').utils;
import {Settings} from "~/src/services/SettingsService";

describe('Test branch model', () => {
    it('Should be created without issues', () => {
        const branch = new Branch('bug/test', false);
        expect(branch.getName(), 'Correct name').to.equal('bug/test');
        expect(branch.isCurrent(), 'Correct is not current').to.equal(false);
        branch.setIsCurrent(true);
        expect(branch.isCurrent(), 'Correct is current').to.equal(true);
        expect(branch.getTimeSpent(), 'Correct spent time').to.equal(0);
        expect(branch.getLastAccess(), 'Correct last access').to.equal(undefined);
        // // tick 4 times
        new Array(4).fill(0).forEach(function(){
            branch.tick()
        });
        expect(branch.getTimeSpent(), 'Increased time spent').to.equal(4);
    });
    it('Should test that time spent after inactive time is reduced', () => {
        const branch = new Branch('bug/test', true);
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function(){
            branch.tick()
        });
        expect(branch.getTimeSpent(), 'Increased time spent').to.equal(halfInactivity);
        new Array(halfInactivity).fill(0).forEach(function(){
            branch.tick()
        });
        expect(branch.getTimeSpent(), 'Increased time spent after inactive time').to.equal(0);
    });
    it('Should commit time on file change notification', ()=> {
        const branch = new Branch('bug/test', true);
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function(){
            branch.tick()
        });
        branch.fileChanged();
        expect(branch.getTimeSpent(), 'Increased time spent after file changed').to.equal(halfInactivity);
        new Array(Settings.inactivityTimeInSeconds).fill(0).forEach(function(){
            branch.tick()
        });
        expect(branch.getTimeSpent(), 'Increased time spent after inactive time').to.equal(halfInactivity);
    });
    it('Should have proper last access after file changed', ()=>{
        const branch = new Branch('bug/test', true);
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function(){
            branch.tick()
        });
        const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        branch.fileChanged();
        expect(moment(branch.getLastAccess()).format('YYYY-MM-DD HH:mm:ss') === date,
               'Last access should equal to time when file was changed').to.equal(true);
    });
});