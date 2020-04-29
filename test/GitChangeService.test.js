import {prepareGit} from "./data/git.data";

const expect = require('chai').expect;
const {sandbox, clock} = require('~/test/TestHelper').utils;
import * as gitData from '../test/data/git.data'

const $inject = require('../src/services/Injector');

describe('Should notify on git diff', () => {
    afterEach(() => {
        $inject.revert('simple-git/promise');
    });
    it('Should notify observer when git diff differs', async () => {
        // prepareGit();
        const {GitChangeService} = require("~/src/services/GitChangeService");
        const {Settings} = require("~/src/services/SettingsService");

        const firstGitFunc = sandbox.stub().callsFake((dir) => {
            if (dir === 'dir1') {
                return {
                    diff : sandbox.stub().returns(Promise.resolve('111'))
                }
            } else {
                return {
                    diff : sandbox.stub().returns(Promise.resolve('111'))
                }
            }
        });
        $inject.replace('simple-git/promise', firstGitFunc, 'replacement test 1');
        GitChangeService.reset();

        let called1 = false;
        let called2 = false;

        const removeCall1 = GitChangeService.subscribe('dir1', () => called1 = true);
        const removeCall2 = GitChangeService.subscribe('dir2', () => called2 = true);

        await clock.tickAsync(1000 * Settings.gitDiffCheckInSeconds);

        expect(!called1, 'First branch dir should not be called first time').to.equal(true);

        const secondGitFunc = sandbox.stub().callsFake((dir) => {
            if (dir === 'dir1') {
                return {
                    diff : sandbox.stub().returns(Promise.resolve('123'))
                }
            } else {
                return {
                    diff : sandbox.stub().returns(Promise.resolve('111'))
                }
            }
        });
        $inject.replace('simple-git/promise', secondGitFunc, 'replacement test 2');

        await clock.tickAsync(1000 * Settings.gitDiffCheckInSeconds );
        expect(called1, 'First branch dir should be called second time').to.equal(true);
        expect(!called2, 'Seconds branch should not be called second time or first time').to.equal(true);
        removeCall1();
        removeCall2();
    })
});