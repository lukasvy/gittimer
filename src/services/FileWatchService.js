
import {RepositoriesList} from "~/src/services/RepositoriesList";
import {GitChangeService} from "~/src/services/GitChangeService";

const listenerDirsList = {};

RepositoriesList.onDataRefresh(renewRepoWatch);


function renewRepoWatch() {
    const listenerDirs = Object.keys(listenerDirsList);
    const allDirs = RepositoriesList.get().map((repo) => repo.getDir());
    const toWatch = allDirs.filter((dir) => !listenerDirs.includes(dir));
    const toRemoveWatch = listenerDirs.filter((dir) => !allDirs.includes(dir));

    toWatch.forEach((w) => watch(w));
    toRemoveWatch.forEach((w) => unwatch(w));
}

/**
 * @param dir
 */
function watch(dir) {
    if (listenerDirsList[dir]) {
        return;
    }
    listenerDirsList[dir] = GitChangeService.subscribe(dir, () => {
        const repo = RepositoriesList.get().find((repo) => repo.getDir() === dir);
        if (repo) {
            repo.fileChanged();
            RepositoriesList.storeData();
        }
    });
}

/**
 * @param dir
 * @returns {Promise<void>}
 */
async function unwatch(dir) {
    listenerDirsList[dir]();
    delete listenerDirsList[dir];
}

function pause() {
    Object.keys(listenerDirsList).forEach((key) => unwatch(listenerDirsList[key]));
}

function start() {
    renewRepoWatch();
}

export const FileWatchService = {
    pause,
    start
};