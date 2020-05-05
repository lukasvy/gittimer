import * as moment from 'moment';

const expect = require('chai').expect;
const {sandbox, clock} = require('~/test/TestHelper').utils;
import {Settings} from "~/src/services/SettingsService";
import {Repository} from "~/src/models/Repository";

describe('Test branch model', () => {
    it('Should be created without issues', async () => {
        const repo = new Repository('testrepo', 'testdir');
        await repo.init();
        expect(repo.getName(), 'Correct name').to.equal('testrepo');
        expect(repo.isActive(), 'Correct is active').to.equal(false);
        repo.setIsActive(true);
        expect(repo.isActive(), 'Correct is active').to.equal(true);
        expect(repo.getTimeSpent(), 'Correct spent time').to.equal(0);
        expect(repo.getLastAccess(), 'Correct last access').to.equal(undefined);
        // // tick 4 times
        new Array(4).fill(0).forEach(function () {
            repo.tick()
        });
        expect(repo.getTimeSpent(), 'Increased time spent').to.equal(4);
    });
    it('Should test that time spent after inactive time is reduced', async() => {
        const repo = new Repository('testrepo', 'testdir');
        await repo.init();
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function () {
            repo.tick()
        });
        expect(repo.getTimeSpent(), 'Increased time spent').to.equal(halfInactivity);
        new Array(halfInactivity).fill(0).forEach(function () {
            repo.tick()
        });
        expect(repo.getTimeSpent(), 'Increased time spent after inactive time').to.equal(0);
    });
    it('Should commit time on file change notification', async() => {
        const repo = new Repository('testrepo', 'testdir');
        await repo.init();
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function () {
            repo.tick()
        });
        repo.fileChanged();
        expect(repo.getTimeSpent(), 'Increased time spent after file changed').to.equal(halfInactivity);
        new Array(Settings.inactivityTimeInSeconds).fill(0).forEach(function () {
            repo.tick()
        });
        expect(repo.getTimeSpent(), 'Increased time spent after inactive time').to.equal(halfInactivity);
    });
    it('Should have proper last access after file changed', async() => {
        const repo = new Repository('testrepo', 'testdir');
        await repo.init();
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function () {
            repo.tick()
        });
        const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        repo.fileChanged();
        expect(moment(repo.getLastAccess()).format('YYYY-MM-DD HH:mm:ss') === date,
               'Last access should equal to time when file was changed').to.equal(true);
    });
    it('Should add normal branch', async () => {
        const repo = new Repository('testrepo', 'testdir');
        await repo.init();
        await repo.addBranch({
                           name   : 'bug/test',
                           current: true
                       });
        expect(repo.getCurrentBranch().getName() === 'bug/test',
               'Get correct active branch').to.equal(true);
        await repo.addBranch({
                           name   : 'bug/test2',
                           current: true
                       });
        expect(repo.getCurrentBranch().getName() === 'bug/test2',
               'Get correct active second branch').to.equal(true);
        await repo.switchCurrentBranchByName('bug/test');
        // wrong branch name
        await repo.switchCurrentBranchByName('bug/test1');
        expect(repo.getCurrentBranch().getName() === 'bug/test',
               'Get correct switched active branch').to.equal(true);
    });
    it('Should time branches based on active branch', async () => {
        const repo = new Repository('testrepo', 'testdir');
        await repo.init();
        await repo.addBranch({
                           name   : 'bug/test',
                           current: true
                       });
        await repo.addBranch({
                           name   : 'bug/test2',
                           current: true
                       });
        const halfInactivity = Settings.inactivityTimeInSeconds / 2;
        new Array(halfInactivity).fill(0).forEach(function () {
            repo.tick()
        });
        expect((await repo.getBranches())[0].getTimeSpent(),
               'Not current branch should not have time counted').to.equal(0);
        expect((await repo.getBranches())[1].getTimeSpent(),
               'Current branch should have time counted').to.equal(halfInactivity);
        await repo.switchCurrentBranchByName('bug/test');
        expect((await repo.getBranches())[1].getTimeSpent(),
               'Current should have 0 counter when no changes were done and it was switched to different branch').to.equal(0);
    });
});