const fs = require("fs");
// https://github.com/steveukx/git-js
const git = require('simple-git/promise');
const path = require('path');
const {dialog} = require('electron').remote;
const Store = require('electron-store');

const store = new Store();

import {Repository} from "../models/Repository";
import {TickerService} from "./TickerService";

let tick = 0;

const repositories = [];
const subscriptions = {
    'switchBranch': [],
    'dataRefresh' : []
};

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
        subscriptions['switchBranch'].forEach(call => call(toBranchName));
    }
}

function commitChanges(latestLog) {

}

function getLogs(dir) {
    return git(dir)
        .log()
        .catch(e => repoError(get().find(repo => repo.getDir() === dir), e));
}

function deleteRepo(repo) {
    const index = repositories.findIndex(repo);
    if (index > -1) {
        repositories.splice(index, 1);
    }
}

function repoError(repo, error) {
    if (repo)
    {
        deleteRepo(repo);
        storeData();
    }
    dialog.showErrorBox('Uh Oh!', error.message)
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
    return git(dir).checkIsRepo().catch(() => throw new Error(`${dir} is not a git repository`));
}

/**
 * @param dir
 * @return {Promise<simplegit.BranchSummary>}
 */
function getAllBranches(dir) {
    return git(dir).branch();
}

/**
 * @param dir
 * @return {Promise<string>}
 */
function getRepoName(dir) {
    return git().raw(['remote', '-v'])
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
                           Promise.all(
                               [getAllBranches(dir), getRepoName(dir), getLogs(dir)]
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
                       ]);
}

function createFromData() {
    const data = store.get('gittimer-data');
    if (data)
    {
        data.map(part => Repository.unserialize(part)).forEach(part => get().push(part));
    }
}

function storeData() {
    store.set('gittimer-data', get().map(repo => repo.serialize()));
    subscriptions['dataRefresh'].forEach(call => call());
}

/**
 * @return {[]}
 */
function get() {
    return repositories;
}

function subscribe(type, call) {
    if (subscriptions[type] && subscriptions[type].lastIndexOf(call) < 0)
    {
        subscriptions[type].push(call)
    }
}

function unsubscribe(type, call) {
    if (subscriptions[type])
    {
        const index = subscriptions[type].lastIndexOf(call);
        if (index > -1)
        {
            subscriptions[type].splice(index, 1);
        }
    }
}

function getActiveRepo() {
    return get().find(part => part.isActive());
}

function getActiveBranch() {
    return (getActiveRepo() ? getActiveRepo().getBranches() : [])
        .find(part => part.isCurrent())
}

export const RepositoriesList = {
    createFromDir,
    createFromData,
    storeData,
    subscribe,
    unsubscribe,
    getActiveRepo,
    getActiveBranch,
    get
};