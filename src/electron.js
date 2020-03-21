'use strict';

import {AppService} from "./services/AppService";

const {app, BrowserWindow, Tray, Menu, powerMonitor} = require('electron');

let tray = null;
let myWindow = null;
let quitCalled = false;

const gotTheLock = app.requestSingleInstanceLock();

const [windowWidth, windowHeight] = [500, 600];

function createWindow() {
    let win = new BrowserWindow({
                                    width         : windowWidth,
                                    height        : windowHeight,
                                    show          : false,
                                    maximizable   : false,
                                    resizable     : false,
                                    center        : true,
                                    webPreferences: {
                                        nodeIntegration: true
                                    },
                                    icon          : __dirname + '/public/icons/git-branch.ico'
                                });


    win.removeMenu();
    myWindow = win;
    win.loadFile('index.html');
    myWindow.on('minimize', function (event) {
        event.preventDefault();
        myWindow.hide();
    });
    win.openDevTools();
    myWindow.on('show', function (event) {
        win.setBounds({width    : windowWidth,
                          height: windowHeight
                      });
    });

    myWindow.on('close', function (event) {
        if (!quitCalled)
        {
            if (!app.isQuiting)
            {
                event.preventDefault();
                myWindow.hide();
            }
            return false;
        } else
        {
            return true;
        }
    });

    const contextMenu = Menu.buildFromTemplate(
        [
            // {
            //     label: 'Settings',
            //     type: 'normal',
            //     click: () => {
            //         win.show();
            //     }
            // },
            {type: 'separator'},
            {
                label: 'Quit',
                type: 'normal',
                click: () => {
                    quitCalled = true;
                    app.quit();
                }
            },
        ]);
    tray = new Tray('./public/icons/git-branch.png');
    tray.setToolTip('Git Timer');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        win.show();
    });

    powerMonitor.on('resuming', () => {
        myWindow.webContents.send('resuming');
    });

    powerMonitor.on('unlock-screen', () => {
        myWindow.webContents.send('unlock-screen');
    });

    powerMonitor.on('suspend', () => {
        myWindow.webContents.send('suspend');
    });

    powerMonitor.on('lock-screen', () => {
        myWindow.webContents.send('lock-screen');
    });

    myWindow.show();
}

if (!gotTheLock)
{
    app.quit()
} else
{
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (myWindow)
        {
            if (myWindow.isMinimized()) myWindow.restore();
            myWindow.focus();
        }
    });
    app.on('ready', createWindow);
}