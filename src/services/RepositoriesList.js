const fs = require("fs");
const git = require('simple-git/promise');
const path = require('path');
const endOfLine = require('os').EOL;

import {Repository} from "../models/Repository";

const repositories = [];

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
                                      const repoData = new Repository(data[1], active);
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

function add() {

}

function get() {
    return repositories;
}

export const RepositoriesList = {
    createFromDir,
    createFromData,
    add,
    get
};