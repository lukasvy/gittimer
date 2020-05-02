import {RepositoriesList} from "~/src/services/RepositoriesList";
import {DialogService} from "~/src/services/DialogService";

const {Menu} = require('electron').remote;

let isWorking = false;

function pause() {

}

function openList(e) {
    return new Promise((res, rej) => {
        if (isWorking)
        {
            res();
            return;
        }
        const template = RepositoriesList.get().map(repo => ({
            label: repo.getName() + (repo.isActive() ? ' ✔' : ''),
            type : 'normal',
            click: () => {
                RepositoriesList.switchActiveRepo(repo);
                res();
            }
        }));
        const menu = Menu.buildFromTemplate(template);
        menu.popup({
                       x: e.clientX,
                       y: e.clientY,
                       callback: () => res()
                   });
    });
}

function openMenu(e) {
    return new Promise((res, rej) => {
        const template = [{
            label: 'New repo',
            type : 'normal',
            click: () => {
                if (isWorking)
                {
                    res();
                    return Promise.resolve(true);
                }
                isWorking = true;
                return DialogService.showOpenDialog(
                    {properties: ['openDirectory']})
                                    .then(async (dir) => {
                                        if (Array.isArray(dir.filePaths) && dir.filePaths[0])
                                        {
                                            return await RepositoriesList.createFromDir(dir.filePaths[0]);
                                        }
                                        return dir;
                                    })
                                    .catch((e) => {
                                        DialogService.showErrorBox('Uh Oh!', e.message, e);
                                        rej(e);
                                    })
                                    .finally(() => {
                                        isWorking = false;
                                        res();
                                    });
            }
        }, {
            label: 'Delete active repo',
            type : 'normal',
            click: () => {
                if (isWorking)
                {
                    res();
                    return Promise.resolve(true);
                }
                isWorking = true;
                return DialogService.showMessageBox(
                    {
                        type   : 'question',
                        buttons: ['Yes', 'No'],
                        title  : 'Confirm',
                        message: `Are you sure you want to remove ${RepositoriesList.getActiveRepo().getName()} ?`
                    }).then(async result => result.response === 0 ?
                                            await RepositoriesList.removeRepo(RepositoriesList.getActiveRepo()) :
                                            Promise.resolve(undefined))
                                    .catch(rej)
                                    .finally(() => {
                                        isWorking = false;
                                        res();
                                    });
            }
        }
        ];
        const menu = Menu.buildFromTemplate(template);

        menu.popup({
                       x: e.clientX,
                       y: e.clientY
                   });
    });
}

/**
 * @return {Object}
 */
export const SettingsMenuService = {
    openMenu,
    openList,
    pause,
    isPaused: () => isWorking
};