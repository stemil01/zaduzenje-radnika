const { app, BrowserWindow, ipcMain } = require('electron');
const ejse = require('ejs-electron');
const database = require('./db.js');
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

ipcMain.on("list-Artikl", async () => {
    let rows = await database.list_Artikl();
    console.log('3');
    console.log(rows);
    ejse.data('rows_Artikl', rows);
});
