const { app, BrowserWindow } = require('electron');
const ejse = require('ejs-electron');
const db = require('./db.js');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('views/index.ejs');
}

ejse.options('root', './views');
ejse.data('rows', [['stefan', 'milenkovic'], ['marko', 'filipovic'], ['mirko', 'stefanovic']]);

app.whenReady()
    .then(createWindow);
