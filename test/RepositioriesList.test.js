import {prepareGit} from "../test/data/git.data";

const expect = require('chai').expect;
const {sandbox, clock} = require('~/test/TestHelper').utils;
import * as gitData from '../test/data/git.data'
import {Settings} from "@/services/SettingsService";

const $inject = require('../src/services/Injector');

const {gitFunctionObj} = prepareGit();

function defaultPrepare(dir) {
    const fs = require('fs');
    const existsSpy = sandbox.stub().returns(true);
    const readdirSyncStub = sandbox.stub();
    const isDirStub = sandbox.stub().returns(true);
    const isDirSpecificStub = sandbox.stub().returns(true);
    const {gitFunctionObj, gitRawStub} = prepareGit();

    const gitFunctStub = sandbox.stub().callsFake(() => gitFunctionObj);
    $inject.replace('simple-git/promise', gitFunctStub);
    fs.existsSync = existsSpy;
    fs.lstatSync = function () {
        return {isDirectory: isDirStub};
    };
    fs.readdirSync = readdirSyncStub.returns([{
        isDirectory: isDirSpecificStub,
        name       : '.git'
    }]);

    return {
        gitFunctStub,
        gitFunctionObj,
        gitRawStub
    }
}

describe('Repositories list should work as expected', () => {
    afterEach(async () => {
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        $inject.revert('simple-git/promise');
        await RepositoriesList.removeRepo();
    });
    it('Should create repo list from directory', async () => {
        const dir = 'somedirname';
        const {gitFunctStub, gitRawStub} = defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        await RepositoriesList.createFromDir(dir);
        expect(gitFunctStub.alwaysCalledWith(dir), 'Git should be called with ' + dir).to.equal(true);
        expect(gitRawStub.calledWith(['remote', '-v']), 'Raw should be called with specific params')
            .to.equal(true);
        expect(RepositoriesList.get().length).to.equal(1);
        expect((await RepositoriesList.get()[0].getBranches()).length, 'There should be two branches')
            .to.equal(2);
        expect((await RepositoriesList.get()[0].getBranches())[0].isCurrent(), 'First branch should be current')
            .to.equal(true);
        expect((await RepositoriesList.get()[0].getBranches())[1].getName(), 'Second branch name should match')
            .to.equal('test2');
        expect((await RepositoriesList.get()[0].getBranches())[1].isCurrent(), 'Second branch should not be current')
            .to.equal(false);
        expect(typeof RepositoriesList.get()[0].serialize).to.not.equal(undefined);
    });
    it('Should remind when branch is changed', async () => {
        const dir = 'somedirname';
        const {gitFunctionObj} = defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        await RepositoriesList.createFromDir(dir);
        let called = false;
        const clear = RepositoriesList.onSwitchBranch(() => called = true);
        gitFunctionObj.status = sandbox.stub().returns(Promise.resolve({current: 'test2'}));
        await clock.tickAsync(1000 * Settings.checkForRepoChangeInSeconds);
        // have to do this manually as tick is not following asynchronous loop
        await RepositoriesList.switchActiveBranch(RepositoriesList.getActiveRepo(), 'test2');
        expect(called, 'Switch callback should be called').to.equal(true);
        expect(RepositoriesList.get()[0].getCurrentBranch().getName(), 'Switched branch should be returned')
            .to.equal('test2');
        gitFunctionObj.status = sandbox.stub().returns(Promise.resolve({current: 'test3'}));
        await clock.tickAsync(1000 * 6);
        // have to do this manually as tick is not following asynchronous loop
        await RepositoriesList.switchActiveBranch(RepositoriesList.getActiveRepo(), 'test3');
        expect(RepositoriesList.get()[0].getCurrentBranch().getName(), 'Switched to new branch should be returned')
            .to.equal('test3');
        clear();
    });
    it('Should count time on tick', async () => {
        const dir = 'somedirname';
        defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        await RepositoriesList.createFromDir(dir);
        const timeSpent1 = RepositoriesList.get()[0].getTimeSpent();
        await clock.tickAsync(1000 * 6);
        const timeSpent2 = RepositoriesList.get()[0].getTimeSpent();
        expect(timeSpent1 < timeSpent2).to.equal(true)
    });
    it('Should serialize and deserialize correnctly', async () => {
        const dir = 'somedirname';
        const {gitFunctionObj} = defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        let called = false;
        RepositoriesList.onDataRefresh(() => called = true);
        await RepositoriesList.createFromDir(dir);
        await clock.tickAsync(1000 * 6);
        expect(called, 'Data refresh callback should happen on change').to.equal(true);
        gitFunctionObj.status = sandbox.stub().returns(Promise.resolve({current: 'test3'}));
        await clock.tickAsync(1000 * 6);
        const serialized = RepositoriesList.getActiveRepo().serialize();
        const serializedBranch = (await RepositoriesList.getActiveRepo().getBranches())[0].serialize();
        delete serialized.branches;
        RepositoriesList.storeData();
        RepositoriesList.reset();
        await RepositoriesList.createFromData();
        const serialized2 = RepositoriesList.getActiveRepo().serialize();
        const serializedBranch2 = (await RepositoriesList.getActiveRepo().getBranches())[0].serialize();
        delete serialized2.branches;
        expect((await RepositoriesList.get()[0].getBranches()).length).to.equal(3);
        expect(JSON.stringify(serialized) === JSON.stringify(serialized2), 'All serialized data for repo is fine').to.equal(true);
        expect(JSON.stringify(serializedBranch) === JSON.stringify(serializedBranch2), 'All serialized data for branch is fine').to.equal(true);
    });
    it('Should handle multiple repositories', async () => {
        const dir = 'somedirname';
        const dir2 = 'somedirname2';
        defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        let called = false;
        RepositoriesList.onDataRefresh(() => called = true);
        await RepositoriesList.createFromDir(dir);
        defaultPrepare(dir2);
        await RepositoriesList.createFromDir(dir2);
        expect(RepositoriesList.get().length, 'Two repos should be added to list').to.equal(2);
        expect(RepositoriesList.getActiveRepo().getDir(), 'Active repo should be named somedirname2').to.equal(dir2);
        await RepositoriesList.removeRepo(RepositoriesList.get()[1]);
        expect(RepositoriesList.get().length, 'Remove first repo').to.equal(1);
        expect(RepositoriesList.get()[0].getDir(), 'Check dir of repo that was left').to.equal('somedirname');
        expect(RepositoriesList.get()[0].isActive(), 'Check that other repo is activate after first repo deletion').to.equal(true);
        await RepositoriesList.removeRepo();
        expect(RepositoriesList.get().length, 'Remove second repo').to.equal(0);
    });
    it('Should not add the same repo twice', async () => {
        const dir = 'somedirname';
        defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        let called = false;
        RepositoriesList.onDataRefresh(() => called = true);
        await RepositoriesList.createFromDir(dir);
        await RepositoriesList.createFromDir(dir);
        expect(RepositoriesList.get().length).to.equal(1);
    });
    it('When switching branch the repo of that branch should become active', async () => {
        const dir = 'somedirname';
        const dir2 = 'somedirname2';
        defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        await RepositoriesList.createFromDir(dir);
        defaultPrepare(dir2);
        await RepositoriesList.createFromDir(dir2);
        expect(RepositoriesList.getActiveRepo().getDir()).to.equal(dir2);
        RepositoriesList.get()[0].addBranch(
            {
                name   : 'test',
                current: true
            });
        RepositoriesList.get()[0].addBranch(
            {
                name   : 'test2',
                current: false
            });
        await RepositoriesList.switchActiveBranch(RepositoriesList.get()[0], 'test2');
        expect(RepositoriesList.getActiveRepo().getDir(), 'Active repo after branch switching').to.equal(dir);
    });
    it('Should add multiple braches when requested', async () => {
        const dir = 'somedirname';
        defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        await RepositoriesList.removeRepo();
        await RepositoriesList.createFromDir(dir);
        await RepositoriesList.getActiveRepo().addBranches(
            [
                {
                    name   : 'test22',
                    current: true
                }, {
                name   : 'test44',
                current: true
            }]);
        expect((await RepositoriesList.getActiveRepo().getBranches()).length, 'There should be 2 extra branches after adding').to.equal(4);
    });
    it('Should return searchable branches when necessary', async () => {
        const dir = 'somedirname';
        defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        const {fetch} = require('~/src/services/FetchRepositoryListService');
        await RepositoriesList.removeRepo();
        await RepositoriesList.createFromDir(dir);
        await RepositoriesList.getActiveRepo().addBranches(
            new Array(30)
                .fill(0)
                .map((part, key) => ({
                             name   : 'bug/testing-bug-' + key,
                             current: key <= 0
                         }
                     )
                )
        );
        const result = await fetch(RepositoriesList.getActiveRepo(), 2, 0, '29');
        expect(result.count, 'Count of returned branches with search text 29').to.equal(1);
        expect(result.list.length, 'List Count of returned branches with search text 29').to.equal(1);
        expect(result.list.map(part => part.getName())[0]).to.equal('bug/testing-bug-29');
        const result2 = await fetch(RepositoriesList.getActiveRepo(), 2, 2, 'bug/');
        expect(result2.count, 'Count of returned branches with search text "bug/" with limit 2 and skip 2').to.equal(30);
        expect(result2.list.length, 'Count of list returned branches with search text "bug/" with limit 2 and skip 2').to.equal(2);
        expect(result2.list.map(part => part.getName()).join('|')).to.equal('bug/testing-bug-2|bug/testing-bug-3');
    })
});