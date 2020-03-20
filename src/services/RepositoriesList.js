const fs = require("fs");
const git = require('simple-git/promise');
const path = require('path');

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
                           git(dir)
                               .branch()
                               .then(function (repo) {
                                   const repoData = new Repository(path.basename(dir), active);
                                   active = false;
                                   repo.all.forEach((branch) => {
                                       repoData.addBranch(
                                           {
                                               name   : branch,
                                               current: repo.branches[branch].current
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