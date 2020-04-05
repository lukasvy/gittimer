const {dialog} = require('electron').remote;
const {BrowserWindow} = require('electron')
let _isOpened = false;

function isOpened() {
    return _isOpened;
}

function showErrorBox(title, message) {
    _isOpened = true;
    return dialog.showErrorBox(title, message).finally(() => _isOpened = false);
}

function showOpenDialog(properties) {
    _isOpened = true;

    return dialog.showOpenDialog(properties).finally(() => _isOpened = false);
}

export const DialogService = {
    isOpened,
    showOpenDialog,
    showErrorBox
};