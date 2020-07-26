const { app, BrowserWindow, ipcMain } = require('electron');
const ejse = require('ejs-electron');
const database = require('./db.js');
const db = require('./db.js');
const { data } = require('ejs-electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('views/index.ejs');
    win.webContents.openDevTools();
}

app.whenReady()
    .then(createWindow);

ipcMain.on("desilo-se", () => {
    let result = 'oj, oj, ojcina';
    console.log(result);
});

ipcMain.on("list-Artikl", () => {
    let rows = database.list_Artikl();
    ejse('rows_Artikl', rows);
});
