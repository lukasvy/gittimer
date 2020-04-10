import {Create} from "~/src/services/Observable";
import {RepositoriesList} from "~/src/services/RepositoriesList";
import {DialogService} from "~/src/services/DialogService";

const {Menu} = require('electron').remote;


function pause() {

}

function openMenu(e) {
    const template = [{
        label: 'New Repo',
        type : 'normal',
        click: () => {
            DialogService.showMessageBox(
                {
                    type   : 'question',
                    buttons: ['Yes', 'No'],
                    title  : 'Confirm',
                    message: 'Are you sure you want to add a new repo? This action will remove current repo.'
                }).then(result => result.response === 0 ? RepositoriesList.removeRepo() : undefined);
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
export const SettingsMenuService = Create({
                                              openMenu,
                                              pause
                                          });