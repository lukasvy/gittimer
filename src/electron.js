'use strict';

const Positioner = require('electron-positioner');
const {app, BrowserWindow, Tray, Menu, powerMonitor} = require('electron');

let tray = null;
let myWindow = null;
let quitCalled = false;

const gotTheLock = app.requestSingleInstanceLock();

const [windowWidth, windowHeight] = [350, 400];

function createWindow() {
    let win = new BrowserWindow({
                                    width         : windowWidth,
                                    height        : windowHeight,
                                    show          : false,
                                    movable       : false,
                                    closable      : false,
                                    skipTaskbar   : true,
                                    frame         : false,
                                    alwaysOnTop   : true,
                                    opacity       : 0,
                                    hasShadow     : false,
                                    transparent   : true,
                                    titleBarStyle : 'hidden',
                                    webPreferences: {
                                        nodeIntegration: true
                                    },
                                    icon          : __dirname + '/public/icons/git-branch.ico'
                                });
    win.removeMenu();

    function showWindow(browserWindow, tray) {
        let positioner = new Positioner(browserWindow);
        const trayPos = tray.getBounds();
        let windowPosition = '';
        let addX = 0;
        let addY = 0;
        if (trayPos.x > 300)
        {
            if (trayPos.y > 300)
            {
                windowPosition = 'trayBottomCenter';
            } else
            {
                windowPosition = 'trayCenter';
            }
        } else
        {
            if (trayPos.y > 300)
            {
                windowPosition = 'trayBottomLeft';
                addX += trayPos.width;
            } else
            {
                windowPosition = 'trayCenter';
            }
        }


        let {x, y} = positioner.calculate(windowPosition, trayPos);
        browserWindow.setPosition(Math.round(x + addX), Math.round(y + addY));
        browserWindow.show();
    }


    win.removeMenu();
    myWindow = win;
    myWindow.loadFile('index.html');
    myWindow.on('minimize', function (event) {
        event.preventDefault();
        myWindow.hide();
    });

    myWindow.on('show', () => {
        setTimeout(() => {
            myWindow.setOpacity(1);
        }, 200);
    });
    myWindow.on('hide', () => {
        myWindow.setOpacity(0);
    });

    // win.openDevTools();
    myWindow.on('show', function (event) {
        myWindow.setBounds({
                               width : windowWidth,
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
            {
                label: 'Quit',
                type : 'normal',
                click: () => {
                    quitCalled = true;
                    app.exit(0)
                }
            },
        ]);
    tray = new Tray('./public/icons/git-branch.png');
    tray.setToolTip('Git Timer');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        showWindow(myWindow, tray);
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

    showWindow(myWindow, tray);
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