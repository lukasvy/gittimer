const {sandbox, clock} = require('~/test/TestHelper').utils;

export const branches = {
    branches: {
        'test' : {
            name : 'test',
            current: true
        },
        'test2': {
            name : 'test2',
            current: false
        },
    },
    all     : ['test', 'test2']
};

export const prepareGit = function () {
    const gitBranchStub = sandbox.stub().returns(Promise.resolve(branches));
    const gitRawStub = sandbox.stub()
                              .returns(Promise.resolve('testName:test'));
    const gitLogStub = sandbox.stub().returns(Promise.resolve({latest: new Date()}));
    const gitStatusStub = sandbox.stub().returns(Promise.resolve({current: 'test'}));
    const gitStatusDiff = sandbox.stub().returns(Promise.resolve('test'));
    const gitFunctionObj = {
        raw   : gitRawStub,
        branch: gitBranchStub,
        log   : gitLogStub,
        status: gitStatusStub,
        diff  : gitStatusDiff
    };
    const gitFunctStub = sandbox.stub().callsFake(() => gitFunctionObj);
    return {
        gitFunctionObj,
        gitFunctStub,
        gitRawStub
    };
};