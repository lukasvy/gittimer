const $injector = require('~/src/services/Injector');
// https://github.com/steveukx/git-js
const git = $injector.inject('simple-git/promise', require('simple-git/promise'));
const fs = require("fs");
const path = require('path');
const Store = require('electron-store');

import {Subscription} from "~/src/services/Observable";
import {DialogService} from './DialogService';


const store = new Store();
const dataRefresh = Subscription();
const switchBranch = Subscription();

import {Repository} from "../models/Repository";
import {TickerService} from "./TickerService";

let tick = 0;

const repositories = [];

TickerService.subscribeToTick(() => {
    get().forEach((repo) => repo.tick());
    tick++;
    if (tick === 5)
    {
        tick = 0;
        checkReposForChanges();
        storeData();
    }
});

/**
 * @param repo
 * @param toBranchName
 */
function switchActiveBranch(repo, toBranchName) {
    if (repo.getCurrentBranch().getName() !== toBranchName)
    {
        if (!repo.getBranchByName(toBranchName))
        {
            repo.addBranch({
                               name   : toBranchName,
                               current: false
                           });
        }
        repo.switchCurrentBranchByName(toBranchName);
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

function deleteRepo(repo) {
    const index = repositories.findIndex(repo);
    if (index > -1)
    {
        repositories.splice(index, 1);
        dataRefresh.trigger();
    }
}

function repoError(repo, error) {
    if (repo)
    {
        deleteRepo(repo);
        storeData();
    }
    DialogService.showErrorBox('Uh Oh!', error.message)
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
    if (!fs.existsSync(dir))
    {
        throw new Error(`${dir} does not exists`);
    }
    if (!fs.lstatSync(dir).isDirectory())
    {
        throw new Error(`${dir} is not a directory`);
    }
    let active = true;
    return Promise.all([
                           checkIsGitDir(dir),
                           Promise.all([getAllBranches(dir), getRepoName(dir), getLogs(dir)]
                           )
                                  .then(data => {
                                      const repoData = new Repository(data[1], dir)
                                          .setLatestCommit(data[2].latest)
                                          .setIsActive(active);
                                      active = false;
                                      data[0].all.forEach((branch) => {
                                          repoData.addBranch(
                                              {
                                                  name   : branch,
                                                  current: data[0].branches[branch].current
                                              })
                                      });
                                      get().push(repoData);
                                      return repoData;

                                  })
                       ]).finally(dataRefresh.trigger);
}

function createFromData() {
    const data = store.get('gittimer-data');
    if (data)
    {
        data.map(part => Repository.unserialize(part)).forEach(part => get().push(part));
        dataRefresh.trigger();
    }
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
    return (getActiveRepo() ? getActiveRepo().getBranches() : [])
        .find(part => part.isCurrent())
}

function removeRepo() {
    repositories.splice(0, 1);
    storeData();
    dataRefresh.trigger();
}

function reset() {
    tick = 0;
    while(repositories.length) {repositories.pop()};
}

export const RepositoriesList = {
    createFromDir,
    createFromData,
    storeData,
    onDataRefresh : dataRefresh.subscribe,
    onSwitchBranch : switchBranch.subscribe,
    removeRepo,
    getActiveRepo,
    getActiveBranch,
    reset,
    get
};