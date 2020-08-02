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
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    win.loadFile('views/main.ejs');
    win.webContents.openDevTools();

    ipcMain.on("list-Artikl", () => {
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
            FROM Artikl`, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Artikl", rows);
            });
    });

    // ARTIKL
    ipcMain.on("openWin_Artikl", () => {
        let insertWin = new BrowserWindow({
            width: 600,
            height: 200,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });
        insertWin.removeMenu();

        insertWin.loadFile('views/popups/insertArtikl.ejs');
        insertWin.webContents.openDevTools();
    });

    ipcMain.on("insert-Artikl", (evt, SifraArtikla, Naziv, JedinicaMere, Cena) => {
        database.db.run(`INSERT INTO Artikl(SifraArtikla, Naziv, JedinicaMere, Cena)
                        VALUES(?, ?, ?, ?)`, [SifraArtikla, Naziv, JedinicaMere, Cena], (err) => {
                            if (err) {
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            } else {
                                win.reload();
                            }
                        });
    });

    ipcMain.on("delete-Artikl", (evt, ID_Artikla) => {
        let options = {
            buttons: ["Da", "Ne"],
            message: "Da ste sigurni da zelite da obrisete?"
        };
        let response = dialog.showMessageBoxSync(options);
        if (response == 0) {
            database.db.run(`DELETE FROM Artikl
                            WHERE ID_Artikla=?`, ID_Artikla, (err) => {
                                if (err) {
                                    dialog.showErrorBox("Greska pri brisanju", err.message);
                                } else {
                                    win.webContents.send("deletedRow");
                                }
                            });
        }
    });

    ipcMain.on("edit-Artikl", (evt, ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena) => {
        database.db.run(`UPDATE Artikl
                        SET SifraArtikla=?, Naziv=?, JedinicaMere=?, Cena=?
                        WHERE ID_Artikla=?`, [SifraArtikla, Naziv, JedinicaMere, Cena, ID_Artikla], (err) => {
                            if (err) {
                                dialog.showErrorBox("Pogresno uneti podaci", err.message);
                            }
                        });
    });

    ipcMain.on("sort-Artikl", (evt, attribute, desc) => {
        let sort = desc ? "DESC" : "ASC";
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
                        FROM Artikl
                        ORDER BY ` + attribute + ` ` + sort, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("sort-rows-Artikl", rows);
                        });
    });

    ipcMain.on("search-Artikl", (evt, key, searchBy) => {
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
                        FROM Artikl
                        WHERE ${searchBy} LIKE '${key}%'`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("search-result-Artikl", rows);
                        });
    });


    ipcMain.on("error", (evt, title, message) => {
        dialog.showErrorBox(title, message);
    });
});
