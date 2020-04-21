const expect = require('chai').expect;
const {sandbox} = require('~/test/TestHelper').utils;

import * as gitData from '../test/data/git.data'
import * as $inject from '../src/services/Injector';

function defaultPrepare(dir) {
    const fs = $inject('fs');

    const existsSpy = sandbox.stub().returns(true);
    const lstatSyncSpy = sandbox.stub();
    const readdirSyncStub = sandbox.stub();
    const isDirStub = sandbox.stub().returns(true);
    const isDirSpecificStub = sandbox.stub().returns(true);
    const gitBranchStub = sandbox.stub().returns(Promise.resolve(gitData.branches));
    const gitRawStub = sandbox.stub()
                              .returns(Promise.resolve('testName:test'));
    const gitLogStub = sandbox.stub().returns(Promise.resolve({latest: new Date()}));
    const gitStatusStub = sandbox.stub().returns(Promise.resolve({current: false}));
    const gitFunctStub = sandbox.stub().returns(
        {
            raw   : gitRawStub,
            branch: gitBranchStub,
            log   : gitLogStub,
            status: gitStatusStub
        });
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
        gitRawStub
    }
}

describe('Repositories list should work as expected', () => {
    it('Should create repo list from directory', async () => {
        const dir = 'somedirname';
        const {gitFunctStub, gitRawStub} = defaultPrepare(dir);
        const {RepositoriesList} = require("~/src/services/RepositoriesList");
        await RepositoriesList.createFromDir(dir);
        expect(gitFunctStub.alwaysCalledWith(dir), 'Git should be called with ' + dir).to.equal(true);
        expect(gitRawStub.calledWith(['remote', '-v']), 'Raw should be called with specific params')
            .to.equal(true);
        expect(RepositoriesList.get().length).to.equal(1);
    });
});