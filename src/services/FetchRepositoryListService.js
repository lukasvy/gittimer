import {RepositoriesList} from "@/services/RepositoriesList";
import {ListSearchService} from "@/services/ListSearchService";
import {promiseData} from '@/services/DbService';
import {Branch} from "@/models/Branch";

/**
 *
 * @param {Repository} repo
 * @param {integer} limit
 * @param {integer} skip
 * @returns {Promise<Array<Branch>>}
 */
function query(repo, limit, skip) {
    return new Promise(async (resolve, reject) => {
        try
        {
            const branchesCursor = (repo ? repo : RepositoriesList.getActiveRepo())
                .getBranchesCursor(
                    {
                        name: ListSearchService.getSearchReg()
                    });
            const count = await new Promise((res, rej) => branchesCursor.count(promiseData(res, rej)));
            const branches = await new Promise(
                (res, rej) => branchesCursor.skip(skip).limit(limit).toArray(promiseData(res, rej)))
                .then(data => data.map(part => Branch.unserialize(part)));
            const data = {
                list : branches,
                total: count
            };
            resolve(data);
        } catch (e)
        {
            reject(e);
        }
    })
}

export const fetch = function (repo, limit, skip) {
    limit = Math.max(30, limit);
    return query(repo, limit, skip)
        .then((data) => {
            return {
                list : data.list,
                count: data.total
            }
        })
};