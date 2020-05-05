import {RepositoriesList} from "@/services/RepositoriesList";
import {ListSearchService} from "@/services/ListSearchService";
import {promiseData} from '@/services/DbService';
import {Branch} from "@/models/Branch";

const CryptoJS = require("crypto-js");

let cache = {};

RepositoriesList.onDataRefresh(() => cache = {});

/**
 *
 * @param {Repository} repo
 * @param {number} limit
 * @param {number} skip
 * @param {string} search
 * @returns {Promise<{total: <number>, list: <Array<Branch>>}>}
 */
function query(repo, limit, skip, search) {
    const repoName = repo.getName();
    if (!cache[repoName])
    {
        cache[repoName] = {};
    }
    const encodedName = CryptoJS.MD5(limit + '-' + skip + '-' + search).toString();
    return cache[repoName][encodedName] ?
           cache[repoName][encodedName] :
           cache[repoName][encodedName] =
               new Promise(async (resolve, reject) => {
                   try
                   {
                       const query = {
                       };
                       const regex = search;
                       if (regex)
                       {
                           query.name = {
                               $regex  : regex,
                               $options: 'i'
                           };
                       }

                       const branchesCursor = repo.getBranchesCursor(query);
                       const count = await new Promise(
                           (res, rej) => branchesCursor.count(promiseData(res, rej)));
                       const branchesCursor2 = repo.getBranchesCursor(query);
                       const branches = await new Promise(
                           (res, rej) => branchesCursor2
                               .skip(skip)
                               .limit(limit)
                               .toArray(promiseData(res, rej)))
                           .then(data => data.map(part => Branch.unserialize(part)))
                           .catch(e => console.error(e));

                       const data = {
                           list : branches,
                           count: count,
                           text : search
                       };
                       resolve(data);
                   } catch (e)
                   {
                       console.error(e);
                       reject(e);
                   }
               })
}

/**
 * @param {Repository} repo
 * @param {number} limit
 * @param {number} skip
 * @param {string} search
 * @returns {Promise<{count: <integer>, list: <Array<Branch>>}>}
 */
export const fetch = function (repo, limit, skip, search) {
    return query(repo, limit, skip, search);
};