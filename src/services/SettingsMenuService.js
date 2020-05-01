import {RepositoriesList} from "~/src/services/RepositoriesList";
import {DialogService} from "~/src/services/DialogService";

const {Menu} = require('electron').remote;

let isWorking = false;

function pause() {

}

function openList(e) {
    if (isWorking)
    {
        return;
    }
    const template = RepositoriesList.get().map(repo => ({
        label: repo.getName()+(repo.isActive() ? ' ✔' : ''),
        type : 'normal',
        click: () => {
            RepositoriesList.switchActiveRepo(repo);
        }
    }));
    const menu = Menu.buildFromTemplate(template);
    menu.popup({
                   x: e.clientX,
                   y: e.clientY
               });
}

function openMenu(e) {
    const template = [{
        label: 'New repo',
        type : 'normal',
        click: () => {
            if (isWorking)
            {
                return;
            }
            isWorking = true;
            DialogService.showOpenDialog(
                {properties: ['openDirectory']})
                         .then((dir) => {
                             if (Array.isArray(dir.filePaths) && dir.filePaths[0])
                             {
                                 return RepositoriesList.createFromDir(dir.filePaths[0]);
                             }
                             return dir;
                         })
                         .catch((e) => DialogService.showErrorBox('Uh Oh!', e.message, e))
                         .finally(() => isWorking = false);
        }
    }, {
        label: 'Delete active repo',
        type : 'normal',
        click: () => {
            if (isWorking)
            {
                return;
            }
            isWorking = true;
            DialogService.showMessageBox(
                {
                    type   : 'question',
                    buttons: ['Yes', 'No'],
                    title  : 'Confirm',
                    message: `Are you sure you want to remove ${RepositoriesList.getActiveRepo().getName()} ?`
                }).then(result => result.response === 0 ?
                                  RepositoriesList.removeRepo(RepositoriesList.getActiveRepo()) :
                                  undefined)
                .finally(() => isWorking = false);
        }
    }
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({
                   x: e.clientX,
                   y: e.clientY
               });
}

/**
 * @return {Object}
 */
export const SettingsMenuService = {
    openMenu,
    openList,
    pause,
    isPaused : () => isWorking
};