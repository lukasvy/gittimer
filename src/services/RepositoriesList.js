const fs = require("fs");
// https://github.com/steveukx
const git = require('simple-git/promise');
const path = require('path');
const endOfLine = require('os').EOL;
const {dialog} = require('electron').remote;

import {Repository} from "../models/Repository";
import {TickerService} from "./TickerService";

let tick = 0;

const repositories = [];
const subscriptions = {
    'switchBranch': []
};

TickerService.subscribeToTick(() => {
    repositories.forEach((repo) => repo.tick());
    tick++;
    if (tick === 5)
    {
        tick = 0;
        checkReposForChanges()
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

function checkReposForChanges() {
    repositories.forEach((repo) => {
        git(repo.getDir())
            .status()
            .then(stat => switchActiveBranch(repo, stat.current))
            .catch(e => dialog.showErrorBox('Uh Oh!', e.message))
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
                               [getAllBranches(dir), getRepoName(dir)]
                           )
                                  .then(data => {
                                      const repoData = new Repository(data[1], active, dir);
                                      active = false;
                                      data[0].all.forEach((branch) => {
                                          repoData.addBranch(
                                              {
                                                  name   : branch,
                                                  current: data[0].branches[branch].current
                                              })
                                      });
                                      repositories.push(repoData);
                                      return repoData;

                                  })
                       ]);
}

function createFromData() {

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

export const RepositoriesList = {
    createFromDir,
    createFromData,
    subscribe,
    unsubscribe,
    get
};