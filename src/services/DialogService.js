const {remote} = require('electron');
const dialog = remote.dialog;

let _isOpened = false;

function isOpened() {
    return _isOpened;
}

function showMessageBox(properties) {
    _isOpened = true;
    return dialog.showMessageBox(remote.getCurrentWindow(), properties).finally(() => _isOpened = false);
}

function showErrorBox(title, message, error) {
    _isOpened = true;
    dialog.showErrorBox(title, message);
    _isOpened = false;
    console.error(error);
    return;
}

function showOpenDialog(properties) {
    _isOpened = true;
    return dialog.showOpenDialog(remote.getCurrentWindow(), properties).finally(() => _isOpened = false);
}

export const DialogService = {
    isOpened,
    showOpenDialog,
    showMessageBox,
    showErrorBox
};