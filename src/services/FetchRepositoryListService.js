import {RepositoriesList} from "@/services/RepositoriesList";
import {ListSearchService} from "@/services/ListSearchService";

function query(limit, skip) {
    return new Promise((resolve, reject) => {
        try
        {
            const branches = RepositoriesList
                .getActiveRepo()
                .getBranches()
                .filter(
                    part =>
                        !part.isCurrent() &&
                        ListSearchService.itemPassesFilter(part.getName()))
                .sort((a, b) => {
                    if (!b.getLastAccess() && a.getLastAccess())
                    {
                        return -1;
                    }
                    return a.getLastAccess() > b.getLastAccess() ? -1 : 1;
                });
            const data = {
                list : [...branches]
                    .slice(skip, skip + limit >= branches.length ? undefined : skip + limit),
                total: branches.length
            };
            resolve(data);
        } catch (e)
        {
            reject(e);
        }
    })
}

export const fetch = function (limit, skip) {
    limit = Math.max(30, limit);
    return query(limit, skip)
        .then((data) => {
            return {
                list : data.list,
                count: data.total
            }
        })
};