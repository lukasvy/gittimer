const $injector = require('~/src/services/Injector');
// https://github.com/steveukx/git-js
const originalGit = require('simple-git/promise');
const git = (dir) => {
    return $injector.inject('simple-git/promise', originalGit)(dir);
};
const fs = require("fs");
const path = require('path');
const Store = require('electron-store');

import {Subscription} from "~/src/services/Observable";
import {DialogService} from './DialogService';
import {Settings} from "~/src/services/SettingsService";
import {Repository} from "../models/Repository";
import {TickerService} from "./TickerService";

const store = new Store();
const dataRefresh = Subscription();
const switchBranch = Subscription();

let tick = 1;

const repositories = [];

TickerService.subscribeToTick(() => {
    get().forEach((repo) => repo.tick());
    if (++tick >= Settings.checkForRepoChangeInSeconds)
    {
        tick = 1;
        checkReposForChanges();
        storeData();
    }
});

function switchActiveRepo(repo) {
    get().forEach(r => {
        if (r === repo)
        {
            r.setIsActive(true)
        } else
        {
            r.setIsActive(false)
        }
    });
    dataRefresh.trigger();
}

/**
 * @param repo
 * @param toBranchName
 */
async function switchActiveBranch(repo, toBranchName) {
    if (repo.getCurrentBranch() && repo.getCurrentBranch().getName() !== toBranchName)
    {
        if (!await repo.getBranchByName(toBranchName))
        {
            await repo.addBranch({
                                     name   : toBranchName,
                                     current: false
                                 });
        }
        switchActiveRepo(repo);
        await repo.switchCurrentBranchByName(toBranchName);
        switchBranch.trigger(toBranchName);
        dataRefresh.trigger();
    }
}

function commitChanges(latestLog) {

}

async function getLogs(dir) {
    return git(dir)
        .log()
        .catch(e => repoError(get().find(repo => repo.getDir() === dir), e));
}

async function deleteRepo(repo) {
    const index = repositories.findIndex(repo);
    if (index > -1)
    {
        await repo.cleanup();
        repositories.splice(index, 1);
        if (repositories.length)
        {
            repositories[0].setIsActive(true);
        }
        dataRefresh.trigger();
    }
}

function repoError(repo, error) {
    if (repo)
    {
        deleteRepo(repo);
        storeData();
    }
    DialogService.showErrorBox('Uh Oh!', error.message, error)
}

function checkReposForChanges() {
    get().forEach((repo) => {
        git(repo.getDir())
            .status()
            .then(stat => switchActiveBranch(repo, stat.current))
            .catch(e => repoError(repo, e));
        getLogs(repo.getDir())
            .then(log => commitChanges(log.latest));
    });
}

/**
 * @param dir
 * @return {Promise<unknown>}
 */
async function checkIsGitDir(dir) {
    return new Promise(($resolve, $reject) => {
        if (fs.readdirSync(dir, {withFileTypes: true})
              .filter(dirent => dirent.isDirectory() && dirent.name === '.git')
            .length)
        {
            return $resolve(true);
        }
        throw new Error(`${dir} is not a git repository`)
    });
}

/**
 * @param dir
 * @return {Promise<simplegit.BranchSummary>}
 */
async function getAllBranches(dir) {
    return git(dir).branch();
}

/**
 * @param dir
 * @return {Promise<string>}
 */
async function getRepoName(dir) {
    return git(dir)
        .raw(['remote', '-v'])
        .then(r => {
            let name = path.basename(dir);
            try
            {
                name = r.split(":")[1].match(/^([^\s])+/)[0]
            } catch (e)
            {
            }
            return name;
        });
}

/**
 * @param dir
 * @return Promise
 */
async function createFromDir(dir) {
    if (get().find(part => part.getDir() === dir))
    {
        return Promise.resolve(true);
    }
    if (!fs.existsSync(dir))
    {
        throw new Error(`${dir} does not exists`);
    }
    if (!fs.lstatSync(dir).isDirectory())
    {
        throw new Error(`${dir} is not a directory`);
    }
    return Promise.all([
                           checkIsGitDir(dir),
                           Promise.all([getAllBranches(dir), getRepoName(dir), getLogs(dir)]
                           )
                                  .then(async data => {
                                      const repoData = await new Repository(data[1], dir)
                                          .init();
                                      repoData.setLatestCommit(data[2].latest)
                                              .setIsActive(true);
                                      await repoData.addBranches(Object.values(data[0].branches));
                                      get().push(repoData);

                                      if (getActiveRepo())
                                      {
                                          getActiveRepo().setIsActive(false);
                                      }
                                      const existingRepo = get().find(part => part.getDir() === dir);
                                      if (existingRepo)
                                      {
                                          existingRepo.setIsActive(true);
                                          return;
                                      }

                                      return repoData;

                                  })
                       ]).finally(dataRefresh.trigger);
}

/**
 * @returns {Promise<unknown[]|boolean>}
 */
async function createFromData() {
    if (get().length)
    {
        return Promise.resolve(true);
    }
    const data = store.get('gittimer-data');
    if (data)
    {
        (await Promise.all(data.map(part => Repository.unserialize(part)))
                      .catch((e) => DialogService.showErrorBox('Uh Oh!', e.message, e)))
            .forEach(repo => repo ? get().push(repo) : undefined);
    }
    if (get().length)
    {
        dataRefresh.trigger();
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

function storeData() {
    store.set('gittimer-data', get().map(repo => repo.serialize()));
}

/**
 * @return {[]}
 */
function get() {
    return repositories;
}

function getActiveRepo() {
    return get().find(part => part.isActive());
}

function getActiveBranch() {
    return (getActiveRepo() ? getActiveRepo().getCurrentBranch() : undefined)
}

/**
 * @param repo {Repository|undefined}
 * @returns {Promise<void>}
 */
async function removeRepo(repo) {
    let repos = [];
    if (!repo) {
        repos = get();
    } else {
        repos= [repo];
    }
    await Promise.all(repos.map(async (repo) => {
        let index = 0;
        const repoIndex = get().lastIndexOf(repo);
        if (repo && repoIndex > -1)
        {
            repo.setIsActive(false);
            index = repoIndex;
        }
        repositories.splice(index, 1);
        if (repositories.length)
        {
            repositories[0].setIsActive(true);
        }
        await repo.cleanup();
    }));
    storeData();
    dataRefresh.trigger();
}

function reset() {
    tick = 1;
    while (repositories.length)
    {
        repositories.pop()
    }
    ;
}

export const RepositoriesList = {
    createFromDir,
    createFromData,
    switchActiveBranch,
    storeData,
    onDataRefresh : dataRefresh.subscribe,
    onSwitchBranch: switchBranch.subscribe,
    removeRepo,
    getActiveRepo,
    switchActiveRepo,
    getActiveBranch,
    reset,
    get
};