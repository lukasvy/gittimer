import {RepositoriesList} from "~/src/services/RepositoriesList";
import {DialogService} from "~/src/services/DialogService";
import {AppService} from "@/services/AppService";

const {Menu} = require('electron').remote;

function openList(e) {
    return new Promise((res, rej) => {
        if (AppService.isInProgress())
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
                       x       : e.clientX,
                       y       : e.clientY,
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
                if (AppService.isInProgress())
                {
                    res();
                    return Promise.resolve(true);
                }
                return DialogService.showOpenDialog(
                    {properties: ['openDirectory']})
                                    .then(async (dir) => {
                                        if (Array.isArray(dir.filePaths) && dir.filePaths[0])
                                        {
                                            AppService.triggerProgress(true);
                                            return await RepositoriesList.createFromDir(dir.filePaths[0]).finally(() => AppService.triggerProgress(false));
                                        }
                                        return dir;
                                    })
                                    .catch((e) => {
                                        DialogService.showErrorBox('Uh Oh!', e.message, e);
                                        rej(e);
                                    })
                                    .finally(() => {
                                        res();
                                    });
            }
        }, {
            label: 'Delete active repo',
            type : 'normal',
            click: () => {
                if (AppService.isInProgress())
                {
                    res();
                    return Promise.resolve(true);
                }
                return DialogService.showMessageBox(
                    {
                        type   : 'question',
                        buttons: ['Yes', 'No'],
                        title  : 'Confirm',
                        message: `Are you sure you want to remove ${RepositoriesList.getActiveRepo().getName()} ?`
                    })
                                    .then(async result => {
                                        if (result.response === 0)
                                        {
                                            AppService.triggerProgress(true);
                                            return await RepositoriesList
                                                .removeRepo(RepositoriesList.getActiveRepo())
                                        } else
                                        {
                                            return Promise.resolve(undefined)
                                        }
                                    })
                                    .catch(rej)
                                    .finally(() => {
                                        AppService.triggerProgress(false);
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
};