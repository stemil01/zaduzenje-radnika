const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ejse = require('ejs-electron');
const database = require('./db.js');
const { data } = require('ejs-electron');
const { render } = require('ejs');
const db = require('./db.js');

app.on('ready', () => {
    ejse.data('rows_Artikl', '');

    const win = new BrowserWindow({
        width: 1300,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('views/main.ejs');
    win.webContents.openDevTools();

    ipcMain.on("list-Artikl", () => {
        database.db.all(`SELECT *
            FROM Artikl`, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Artikl", rows);
            });
    });

    ipcMain.on("openWin_Artikl", () => {
        let insertWin = new BrowserWindow({
            width: 600,
            height: 200,
            webPreferences: {
                nodeIntegration: true
            }
        });
        insertWin.removeMenu();

        insertWin.loadFile('views/popups/insertArtikl.ejs');
        insertWin.webContents.openDevTools();
    });

    ipcMain.on("insert-Artikl", (evt, SifraArtikla, Naziv, JedinicaMere, Cena) => {
        database.db.run(`INSERT INTO
                        Artikl (SifraArtikla, Naziv, JedinicaMere, Cena)
                        VALUES (?, ?, ?, ?)`, [SifraArtikla, Naziv, JedinicaMere, Cena], (err) => {
                            if (err) {
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            }
                            win.webContents.send("reload-list-Artikl");
                        });
    });
});
