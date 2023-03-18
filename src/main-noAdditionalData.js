const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ejse = require('ejs-electron');
const database = require('./db.js');
const { data } = require('ejs-electron');
const { render } = require('ejs');
const db = require('./db.js');
const remote = require('@electron/remote/main').initialize();

app.on('ready', () => {
    const win = new BrowserWindow({
        width: 1625,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    win.loadFile(`${__dirname}/../views/main.ejs`);
    // win.loadFile('views/main.ejs');
    // win.webContents.openDevTools();

    // ARTIKL
    ipcMain.on("list-Artikl", () => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
            FROM Artikl
            `, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Artikl", rows);
            });
    });

    ipcMain.on("insert-Artikl", (evt, SifraArtikla, Naziv, JedinicaMere, Cena) => {
        database.db.run(`
            INSERT INTO Artikl(SifraArtikla, Naziv, JedinicaMere, Cena)
            VALUES(?, ?, ?, ?)
            `, [SifraArtikla, Naziv, JedinicaMere, Cena], (err) => {
                if (err) {
                    dialog.showErrorBox('Greska pri unosu podataka', err.message);
                } else {
                    win.reload();
                }
            });
    });

    ipcMain.on("delete-Artikl", (evt, ID_Artikla) => {
        database.db.run(`
            DELETE FROM Artikl
            WHERE ID_Artikla=?
            `, ID_Artikla, (err) => {
                if (err) {
                    throw err;
                } else {
                    win.webContents.send("deletedRow");
                }
            });
    });

    ipcMain.on("edit-Artikl", (evt, ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena) => {
        database.db.run(`
            UPDATE Artikl
            SET SifraArtikla=?, Naziv=?, JedinicaMere=?, Cena=?
            WHERE ID_Artikla=?
            `, [SifraArtikla, Naziv, JedinicaMere, Cena, ID_Artikla], (err) => {
                if (err) {
                    dialog.showErrorBox('Greska pri unosu podataka', err.message);
                } else {
                    win.webContents.send("edited-Artikl");
                }
            });
    });

    // RADNIK
    ipcMain.on("list-Radnik", () => {
        database.db.all(`
            SELECT ID_Radnika, PrezimeIme
            FROM Radnik`, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Radnik", rows);
            });
    });


    ipcMain.on("insert-Radnik", (evt, PrezimeIme) => {
        database.db.run(`
            INSERT INTO Radnik(PrezimeIme)
            VALUES(?)
            `, PrezimeIme, (err) => {
                if (err) {
                    dialog.showErrorBox('Greska pri unosu podataka', err.message);
                } else {
                    win.reload();
                }
            });
    });

    ipcMain.on("delete-Radnik", (evt, ID_Radnika) => {
        database.db.run(`
            DELETE FROM Radnik
            WHERE ID_Radnika=?
            `, ID_Radnika, (err) => {
                if (err) {
                    throw err;
                } else {
                    win.webContents.send("deletedRow");
                }
            });
    });

    ipcMain.on("edit-Radnik", (evt, ID_Radnika, PrezimeIme) => {
        database.db.run(`
            UPDATE Radnik
            SET PrezimeIme=?
            WHERE ID_Radnika=?
            `, [PrezimeIme, ID_Radnika], (err) => {
                if (err) {
                    dialog.showErrorBox('Greska pri unosu podataka', err.message);
                } else {
                    win.webContents.send("edited-Radnik");
                }
            });
    });

    // ULAZ
    ipcMain.on("req-SifraArtikla", (event) => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv
            FROM Artikl
            `, (err, rows) => {
                if (err) {
                    throw err;
                }
                event.sender.send("res-SifraArtikla", rows);
            });
    });

    ipcMain.on("list-Ulaz", () => {
        database.db.all(`
            SELECT U.ID_Ulaza, A.SifraArtikla, A.Naziv, A.JedinicaMere, U.Kolicina, U.Datum
            FROM Ulaz U, Artikl A
            WHERE U.ID_Artikla=A.ID_Artikla
            ORDER BY U.Datum DESC
            `, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Ulaz", rows);
            });
    });

    ipcMain.on("get-JedinicaMere", (event, ID_Artikla) => {
        database.db.get(`
            SELECT JedinicaMere
            FROM Artikl
            WHERE ID_Artikla=?
        `, ID_Artikla, (err, row) => {
            if (err) {
                throw err;
            }
            event.sender.send("JedinicaMere", row);
        });
    });

    ipcMain.on("get-JedinicaMere-UkupnaKolicina", (event, ID_Artikla) => {
        database.db.get(`
            SELECT A.JedinicaMere, ROUND((
                SELECT IFNULL(SUM(Kolicina), 0)
                FROM Ulaz U
                WHERE U.ID_Artikla=A.ID_Artikla
                ) - (
                SELECT IFNULL(SUM(Kolicina), 0)
                FROM Zaduzenje Z
                WHERE Z.ID_Artikla=A.ID_Artikla
                ), 3) [UkupnaKolicina]
            FROM Artikl A
            WHERE A.ID_Artikla=?
            `, ID_Artikla, (err, row) => {
                if (err) {
                    throw err;
                }
                event.sender.send("JedinicaMere-UkupnaKolicina", row);
            });
    });

    ipcMain.on("insert-Ulaz", (evt, ID_Artikla, Kolicina, Datum) => {
        database.db.run(`
            INSERT INTO Ulaz(ID_Artikla, Kolicina, Datum)
            VALUES(?, ?, ?)
        `, [ID_Artikla, Kolicina, Datum], (err) => {
            if (err) {
                dialog.showErrorBox("Greska pri unosu podataka", err.message);
            } else {
                win.reload();
            }
        });
    });

    ipcMain.on("delete-Ulaz", (evt, ID_Ulaza) => {
        database.db.run(`
            DELETE FROM Ulaz
            WHERE ID_Ulaza=?
        `, ID_Ulaza, (err) => {
            if (err) {
                throw err;
            }
            win.webContents.send("deletedRow");
        });
    });

    ipcMain.on("req-Naziv-JedinicaMere", (evt, SifraArtikla) => {
        database.db.get(`
            SELECT Naziv, JedinicaMere
            FROM Artikl
            WHERE SifraArtikla=?
            `, SifraArtikla, (err, row) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("res-Naziv-JedinicaMere", row);
            });
    });

    ipcMain.on("edit-Ulaz", (evt, ID_Ulaza, prev_SifraArtikla, SifraArtikla, prev_Kolicina, Kolicina, Datum) => {
        database.db.run(`
            UPDATE Ulaz
            SET ID_Artikla=(SELECT ID_Artikla FROM Artikl WHERE SifraArtikla=?), Kolicina=?, Datum=?
            WHERE ID_Ulaza=?
        `, [SifraArtikla, Kolicina, Datum, ID_Ulaza], (err) => {
            if (err) {
                dialog.showErrorBox("Greska pri unosu podataka", err.message);
            } else {
                win.webContents.send("edited-Ulaz");
            }
        });
    });
    
    // SKLADISTE
    ipcMain.on("list-Skladiste", () => {
        database.db.all(`
            SELECT A.ID_Artikla, A.Naziv, A.JedinicaMere, A.Cena, ROUND(Res.UkupnaKolicina, 3) [UkupnaKolicina], ROUND(Res.UkupnaKolicina*Cena, 3) [Vrednost]
            FROM (
                SELECT Un.ID_Artikla, IFNULL(SUM(Kolicina), 0) [UkupnaKolicina]
                FROM (
                    SELECT ID_Artikla, Kolicina
                    FROM Ulaz
                    UNION ALL
                    SELECT ID_Artikla, -Kolicina
                    FROM Zaduzenje
                ) Un
                GROUP BY Un.ID_Artikla
            ) Res, Artikl A
            WHERE A.ID_Artikla=Res.ID_Artikla
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            win.webContents.send("rows-Skladiste", rows);
        });
    });

    ipcMain.on("req-Radnik", (event) => {
        database.db.all(`
            SELECT ID_Radnika, PrezimeIme
            FROM Radnik
            `, (err, rows) => {
                if (err) {
                    throw err;
                }
                event.sender.send("res-Radnik", rows);
            });
    });

    // ZADUZENJE
    ipcMain.on("list-Zaduzenje", () => {
        database.db.all(`
            SELECT Z.ID_Zaduzenja, R.PrezimeIme, A.SifraArtikla, A.Naziv, A.JedinicaMere, Z.Kolicina, Z.Datum
            FROM Zaduzenje Z, Radnik R, Artikl A
            WHERE Z.ID_Radnika=R.ID_Radnika AND Z.ID_Artikla=A.ID_Artikla
            ORDER BY Z.Datum DESC
            `, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Zaduzenje", rows);
            });
    });

    ipcMain.on("req-skladiste-SifraArtikla", (event) => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv
            FROM Artikl A
            WHERE (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Ulaz U
                WHERE U.ID_Artikla=A.ID_Artikla
            ) > (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Zaduzenje Z
                WHERE Z.ID_Artikla=A.ID_Artikla
            )
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-skladiste-SifraArtikla", rows);
        });
    });

    ipcMain.on("insert-Zaduzenje", (evt, ID_Radnika, ID_Artikla, Kolicina, Datum) => {
        database.db.run(`
            INSERT INTO Zaduzenje(ID_Radnika, ID_Artikla, Kolicina, Datum)
            VALUES(?, ?, ?, ?)
        `, [ID_Radnika, ID_Artikla, Kolicina, Datum], (err) => {
            if (err) {
                dialog.showMessageBox('Greska pri unosu podataka', err.message);
            } else {
                win.reload();
            }
        });
    });

    ipcMain.on("edit-Zaduzenje", (evt, ID_Zaduzenja, prev_PrezimeIme, prev_SifraArtikla, prev_Kolicina, PrezimeIme, SifraArtikla, Kolicina, Datum) => {
        database.db.run(`
            UPDATE Zaduzenje
            SET ID_Radnika=(SELECT ID_Radnika FROM Radnik WHERE PrezimeIme=?),
                ID_Artikla=(SELECT ID_Artikla FROM Artikl WHERE SifraArtikla=?),
                Kolicina=?,
                Datum=?
            WHERE ID_Zaduzenja=?
        `, [PrezimeIme, SifraArtikla, Kolicina, Datum, ID_Zaduzenja], (err) => {
            if (err) {
                dialog.showErrorBox('Greska pri unosu podataka', err.message);
            } else {
                win.webContents.send("edited-Zaduzenje");
            }
        });
    });

    ipcMain.on("req-Naziv-JedinicaMere-UkupnaKolicina", (evt, SifraArtikla) => {
        database.db.get(`
            SELECT Naziv, JedinicaMere, ROUND((
                SELECT IFNULL(SUM(Kolicina), 0)
                FROM Ulaz
                WHERE ID_Artikla=A.ID_Artikla
            ) - (
                SELECT IFNULL(SUM(Kolicina), 0)
                FROM Zaduzenje
                WHERE ID_Artikla=A.ID_Artikla
            ), 3)
            FROM Artikl A
            WHERE SifraArtikla=?
        `, [SifraArtikla], (err, row) => {
            if (err) {
                throw err;
            }
            win.webContents.send("res-Naziv-JedinicaMere-UkupnaKolicina", row);
        });
    });

    ipcMain.on("delete-Zaduzenje", (evt, ID_Zaduzenja) => {
        database.db.run(`
            DELETE FROM Zaduzenje
            WHERE ID_Zaduzenja=?
        `, ID_Zaduzenja, (err) => {
            if (err) {
                throw err;
            }
            win.webContents.send("deletedRow");
        })
    });

    // RAZDUZENJE
    ipcMain.on("req-zaduzen-Radnik", (event) => {
        database.db.all(`
            SELECT ID_Radnika, PrezimeIme
            FROM Radnik R
            WHERE (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Zaduzenje
                WHERE ID_Radnika=R.ID_Radnika
            ) > (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Razduzenje
                WHERE ID_Radnika=R.ID_Radnika
            )
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-zaduzen-Radnik", rows);
        });
    });

    ipcMain.on("req-zaduzen-Artikl", (event) => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv
            FROM Artikl A
            WHERE (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Zaduzenje
                WHERE ID_Artikla=A.ID_Artikla
            ) > (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Razduzenje
                WHERE ID_Artikla=A.ID_Artikla
            )
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-zaduzen-Artikl", rows);
        });
    });

    ipcMain.on("req-Artikl-zaRadnik", (event, ID_Radnika) => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv
            FROM Artikl A
            WHERE (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Zaduzenje
                WHERE ID_Radnika=? AND ID_Artikla=A.ID_Artikla
            ) > (
                SELECT IFNULL(ROUND(SUM(Kolicina), 3), 0)
                FROM Razduzenje
                WHERE ID_Radnika=? AND ID_Artikla=A.ID_Artikla
            )
        `, [ID_Radnika, ID_Radnika], (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-Artikl-zaRadnik", rows);
        });
    });

    ipcMain.on("req-ZaduzenjePoRadniku", (event, ID_Radnika, ID_Artikla) => {
        database.db.get(`
            SELECT ROUND(IFNULL(SUM(Kolicina), 0) - (
                SELECT IFNULL(SUM(Kolicina), 0)
                FROM Razduzenje
                WHERE ID_Radnika=? AND ID_Artikla=?
            ), 3)
            FROM Zaduzenje
            WHERE ID_Radnika=? AND ID_Artikla=?
        `, [ID_Radnika, ID_Artikla, ID_Radnika, ID_Artikla], (err, row) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-ZaduzenjePoRadniku", row);
        });
    });

    // ZADUZENJE PO RADNIKU
    ipcMain.on("list-Radnik-Zaduzenje", (evt, PrezimeIme) => {
        database.db.all(`
            SELECT '', A.SifraArtikla, A.Naziv, A.JedinicaMere, A.Cena, Res.Kolicina, ROUND(Res.Kolicina*A.Cena, 3) [Vrednost]
            FROM (
                SELECT ID_Artikla, IFNULL(ROUND(SUM(Un.Kolicina), 3), 0) [Kolicina]
                FROM (
                    SELECT ID_Artikla, Kolicina
                    FROM Zaduzenje
                    WHERE ID_Radnika=(SELECT ID_Radnika FROM Radnik WHERE PrezimeIme=?)
                    UNION ALL
                    SELECT ID_Artikla, -Kolicina
                    FROM Razduzenje
                    WHERE ID_Radnika=(SELECT ID_Radnika FROM Radnik WHERE PrezimeIme=?)
                ) Un
                GROUP BY Un.ID_Artikla
                HAVING IFNULL(ROUND(SUM(Un.Kolicina), 3), 0) > 0
            ) Res, Artikl A
            WHERE A.ID_Artikla=Res.ID_Artikla
        `, [PrezimeIme, PrezimeIme], (err, rows) => {
            if (err) {
                throw err;
            }
            win.webContents.send("Radnik-Zaduzenje", rows);
        });
    });

    ipcMain.on("req-ukupno-zaduzenje", (evt, ID_Radnika) => {
        database.db.get(`
            SELECT ROUND(IFNULL(SUM(Z.Kolicina*A.Cena), 0) - (
                SELECT IFNULL(SUM(R.Kolicina*A.Cena), 0)
                FROM Artikl A, Razduzenje R
                WHERE A.ID_Artikla=R.ID_Artikla AND R.ID_Radnika=?
            ), 3)
            FROM Artikl A, Zaduzenje Z
            WHERE A.ID_Artikla=Z.ID_Artikla AND Z.ID_Radnika=?
        `, [ID_Radnika, ID_Radnika], (err, row) => {
            if (err) {
                throw err;
            }
            win.webContents.send("res-ukupno-zaduzenje", Object.values(row)[0]);
        });
    });

    ipcMain.on("insert-Razduzenje", (evt, ID_Radnika, ID_Artikla, Kolicina, Datum) => {
        database.db.run(`
            INSERT INTO Razduzenje(ID_Radnika, ID_Artikla, Kolicina, Datum)
            VALUES(?, ?, ?, ?)
        `, [ID_Radnika, ID_Artikla, Kolicina, Datum], (err) => {
            if (err) {
                dialog.showErrorBox('Greska pri unosu podataka', err.message);
            } else {
                win.reload();
            }
        });
    });

    ipcMain.on("list-Razduzenje", () => {
        database.db.all(`
            SELECT Rz.ID_Razduzenja, R.PrezimeIme, A.SifraArtikla, A.Naziv, A.JedinicaMere, Rz.Kolicina, Rz.Datum
            FROM Radnik R, Artikl A, Razduzenje Rz
            WHERE R.ID_Radnika=Rz.ID_Radnika AND A.ID_Artikla=Rz.ID_Artikla
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            win.webContents.send("rows-Razduzenje", rows);
        });
    });

    ipcMain.on("get-ID_Radnika-ID_Artikla", (evt, PrezimeIme, SifraArtikla) => {
        let ID_Radnika, ID_Artikla;
        database.db.get(`SELECT ID_Radnika FROM Radnik WHERE PrezimeIme=?`, PrezimeIme, (err, row) => {
            if (err) {
                throw err;
            }
            ID_Radnika = Object.values(row)[0];
            database.db.get(`SELECT ID_Artikla FROM Artikl WHERE SifraArtikla=?`, SifraArtikla, (err, row) => {
                if (err) {
                    throw err;
                }
                ID_Artikla = Object.values(row)[0];
                win.webContents.send("ID_Radnika-ID_Artikla", ID_Radnika, ID_Artikla);
            });
        });
    });

    ipcMain.on("edit-Razduzenje", (evt, ID_Razduzenja, prev_ID_Radnika, prev_ID_Artikla, prev_Kolicina, ID_Radnika, ID_Artikla, Kolicina, Datum) => {
        database.db.run(`
            UPDATE Razduzenje
            SET ID_Radnika=?, ID_Artikla=?, Kolicina=?, Datum=?
            WHERE ID_Razduzenja=?
        `, [ID_Radnika, ID_Artikla, Kolicina, Datum, ID_Razduzenja], (err) => {
            if (err) {
                dialog.showErrorBox('Greska pri unosu podataka', err.message);
            } else {
                win.webContents.send("edited-Razduzenje");
            }
        });
    });

    ipcMain.on("delete-Razduzenje", (evt, ID_Razduzenja) => {
        database.db.run(`
            DELETE FROM Razduzenje
            WHERE ID_Razduzenja=?
        `, ID_Razduzenja, (err) => {
            if (err) {
                throw err;
            }
            win.webContents.send("deletedRow");
        });
    });

    // OPSTE
    ipcMain.on("open-insert-window", (evt, path) => {
        let insertWin = new BrowserWindow({
            width: 410,
            height: 260,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            }
        });
        insertWin.removeMenu();

        insertWin.loadFile(path);
        insertWin.webContents.openDevTools();
    });

    ipcMain.on("error", (evt, title, message) => {
        dialog.showErrorBox(title, message);
    });

    win.on('closed', () => {
        database.db.close();
        app.quit();
    });
});

app.on('browser-window-created', (_, window) => {
    require("@electron/remote/main").enable(window.webContents)
})
