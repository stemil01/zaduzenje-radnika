const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ejse = require('ejs-electron');
const database = require('./db.js');
const { data } = require('ejs-electron');
const { render } = require('ejs');
const db = require('./db.js');

app.on('ready', () => {
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

    // ARTIKL
    ipcMain.on("list-Artikl", () => {
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
            FROM Artikl`, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Artikl", rows);
            });
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
                                    throw err;
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
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            } else {
                                win.webContents.send("edited-Artikl");
                            }
                        });
    });

    // ipcMain.on("sort-Artikl", (evt, attribute, desc, key, searchBy) => {
    //     let sort = desc ? 'DESC' : 'ASC';
    //     database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
    //                     FROM Artikl
    //                     WHERE ${searchBy} LIKE '%${key}%'
    //                     ORDER BY ${attribute} ${sort}`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("sort-rows-Artikl", rows);
    //                     });
    // });

    // ipcMain.on("search-Artikl", (evt, key, searchBy) => {
    //     database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena
    //                     FROM Artikl
    //                     WHERE ${searchBy} LIKE '%${key}%'`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("search-result-Artikl", rows);
    //                     });
    // });

    // RADNIK
    ipcMain.on("list-Radnik", () => {
        database.db.all(`SELECT ID_Radnika, PrezimeIme
                        FROM Radnik`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("rows-Radnik", rows);
                        });
    });


    ipcMain.on("insert-Radnik", (evt, PrezimeIme) => {
        database.db.run(`INSERT INTO Radnik(PrezimeIme)
                        VALUES(?)`, PrezimeIme, (err) => {
                            if (err) {
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            } else {
                                win.reload();
                            }
                        });
    });

    ipcMain.on("delete-Radnik", (evt, ID_Radnika) => {
        let options = {
            buttons: ["Da", "Ne"],
            message: "Da ste sigurni da zelite da obrisete?"
        };
        let response = dialog.showMessageBoxSync(options);
        if (response == 0) {
            database.db.run(`DELETE FROM Radnik
                            WHERE ID_Radnika=?`, ID_Radnika, (err) => {
                                if (err) {
                                    throw err;
                                } else {
                                    win.webContents.send("deletedRow");
                                }
                            });
        }
    });

    ipcMain.on("edit-Radnik", (evt, ID_Radnika, PrezimeIme) => {
        database.db.run(`UPDATE Radnik
                        SET PrezimeIme=?
                        WHERE ID_Radnika=?`, [PrezimeIme, ID_Radnika], (err) => {
                            if (err) {
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            } else {
                                win.webContents.send("edited-Radnik");
                            }
                        });
    });

    // ipcMain.on("sort-Radnik", (evt, attribute, desc, key, searchBy) => {
    //     let sort = desc ? 'DESC' : 'ASC';
    //     if (searchBy == 'Ime') {
    //         key = '% ' + key;
    //     }

    //     database.db.all(`SELECT ID_Radnika, PrezimeIme
    //                     FROM Radnik
    //                     WHERE PrezimeIme LIKE '${key}%'
    //                     ORDER BY ${attribute} ${sort}`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("sort-rows-Radnik", rows);
    //                     });
    // });

    // ipcMain.on("search-Radnik", (evt, key, searchBy) => {
    //     if (searchBy == 'Ime') {
    //         key = '% ' + key;
    //     }
    //     database.db.all(`SELECT ID_Radnika, PrezimeIme
    //                     FROM Radnik
    //                     WHERE PrezimeIme LIKE '${key}%'`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("search-result-Radnik", rows);
    //                     });
    // });

    // ULAZ
    ipcMain.on("req-SifraArtikla", (event) => {
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv
                        FROM Artikl`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            event.sender.send("res-SifraArtikla", rows);
                        });
    });

    ipcMain.on("list-Ulaz", () => {
        database.db.all(`SELECT U.ID_Ulaza, A.SifraArtikla, A.Naziv, A.JedinicaMere, U.Kolicina, strftime('%d.%m.%Y.', U.Datum) Datum
                        FROM Ulaz U, Artikl A
                        WHERE U.ID_Artikla=A.ID_Artikla
                        ORDER BY U.Datum DESC`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("rows-Ulaz", rows);
                        });
    });

    ipcMain.on("get-JedinicaMere", (event, ID_Artikla) => {
        database.db.get(`SELECT JedinicaMere
                        FROM Artikl
                        WHERE ID_Artikla=?`, ID_Artikla, (err, row) => {
                            if (err) {
                                throw err;
                            }
                            event.sender.send("JedinicaMere", row);
                        });
    });

    ipcMain.on("insert-Ulaz", (evt, ID_Artikla, Kolicina, Datum) => {
        database.db.serialize(() => {
            database.db.run(`INSERT INTO Ulaz(ID_Artikla, Kolicina, Datum)
                            VALUES(?, ?, ?)`, [ID_Artikla, Kolicina, Datum], (err) => {
                                if (err) {
                                    dialog.showErrorBox("Greska pri unosu podataka", err.message);
                                } else {
                                    database.db.run(`UPDATE Artikl
                                                    SET UkupnaKolicina=UkupnaKolicina + ?
                                                    WHERE ID_Artikla=?`, [Kolicina, ID_Artikla], (err) => {
                                                        if (err) {
                                                            dialog.showErrorBox("Problem sa unetom kolicinom", err.message);
                                                        } else {
                                                            win.reload();
                                                        }
                                                    })
                                }
                            });
        });
    });

    ipcMain.on("delete-Ulaz", (evt, ID_Ulaza) => {
        let options = {
            buttons: ["Da", "Ne"],
            message: "Da ste sigurni da zelite da obrisete?"
        };
        let response = dialog.showMessageBoxSync(options);
        if (response == 0) {
            database.db.serialize(() => {
                database.db.run(`UPDATE Artikl
                                SET UkupnaKolicina=UkupnaKolicina - (
                                    SELECT Kolicina
                                    FROM Ulaz
                                    WHERE ID_Ulaza=?
                                )
                                WHERE ID_Artikla=(
                                    SELECT ID_Artikla
                                    FROM Ulaz
                                    WHERE ID_Ulaza=?
                                )`, [ID_Ulaza, ID_Ulaza], (err) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        database.db.run(`DELETE FROM Ulaz
                                                        WHERE ID_Ulaza=?`, ID_Ulaza, (err) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            win.webContents.send("deletedRow");
                                                        });
                                    }
                                });
            });
        }
    });

    ipcMain.on("req-Naziv-JedinicaMere", (evt, SifraArtikla) => {
        database.db.get(`SELECT Naziv, JedinicaMere
                        FROM Artikl
                        WHERE SifraArtikla=?`, SifraArtikla, (err, row) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("res-Naziv-JedinicaMere", row);
                        });
    });

    ipcMain.on("edit-Ulaz", (evt, ID_Ulaza, prev_SifraArtikla, SifraArtikla, prev_Kolicina, Kolicina, Datum) => {
        database.db.serialize(() => {
            database.db.run(`UPDATE Artikl
                            SET UkupnaKolicina=UkupnaKolicina - ?
                            WHERE SifraArtikla=?`, [prev_Kolicina, prev_SifraArtikla], (err) => {
                                if (err) {
                                    throw err;
                                } else {
                                    database.db.run(`UPDATE Artikl
                                                    SET UkupnaKolicina=UkupnaKolicina + ?
                                                    WHERE SifraArtikla=?`, [Kolicina, SifraArtikla], (err) => {
                                                        if (err) {
                                                            dialog.showErrorBox("Greska pri unosu podataka marko", err.message);
                                                        } else {
                                                            database.db.run(`UPDATE Ulaz
                                                                            SET ID_Artikla=(SELECT ID_Artikla FROM Artikl WHERE SifraArtikla=?), Kolicina=?, Datum=?
                                                                            WHERE ID_Ulaza=?`, [SifraArtikla, Kolicina, Datum, ID_Ulaza], (err) => {
                                                                                if (err) {
                                                                                    dialog.showErrorBox("Greska pri unosu podataka", err.message);
                                                                                } else {
                                                                                    win.webContents.send("edited-Ulaz");
                                                                                }
                                                                            });
                                                            }
                                    });
                                }
                            });
        }); 
    });

    ipcMain.on("search-Ulaz", (evt, key, searchBy) => {
        database.db.all(`SELECT U.ID_Ulaza, A.SifraArtikla, A.Naziv, A.JedinicaMere, U.Kolicina, strftime('%d.%m.%Y.', U.Datum) Datum
                        FROM Ulaz U, Artikl A
                        WHERE A.ID_Artikla=U.ID_Artikla AND ${searchBy} LIKE '%${key}%'
                        ORDER BY U.Datum DESC`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("search-result-Ulaz", rows);
                        });
    });

    ipcMain.on("sort-Ulaz", (evt, attribute, desc, key, searchBy) => {
        let sort = desc ? 'DESC' : 'ASC';
        database.db.all(`SELECT U.ID_Ulaza, A.SifraArtikla, A.Naziv, A.JedinicaMere, U.Kolicina, strftime('%d.%m.%Y.', U.Datum) Datum
                        FROM Ulaz U, Artikl A
                        WHERE A.ID_Artikla=U.ID_Artikla AND ${searchBy} LIKE '%${key}%'
                        ORDER BY ${attribute} ${sort}`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("sort-rows-Ulaz", rows);
                        });
    });

    // SKLADISTE
    ipcMain.on("list-Skladiste", () => {
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena, UkupnaKolicina, Cena*UkupnaKolicina Vrednost
            FROM Artikl`, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("rows-Skladiste", rows);
            });
    });

    ipcMain.on("sort-Skladiste", (evt, attribute, desc, key, searchBy) => {
        let sort = desc ? 'DESC' : 'ASC';
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena, UkupnaKolicina, Cena*UkupnaKolicina Vrednost
                        FROM Artikl
                        WHERE ${searchBy} LIKE '%${key}%'
                        ORDER BY ${attribute} ${sort}`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("sort-rows-Skladiste", rows);
                        });
    });

    ipcMain.on("search-Skladiste", (evt, key, searchBy) => {
        database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena, UkupnaKolicina, Cena*UkupnaKolicina Vrednost
                        FROM Artikl
                        WHERE ${searchBy} LIKE '%${key}%'`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("search-result-Skladiste", rows);
                        });
    });

    // OPSTE
    ipcMain.on("open-insert-window", (evt, path) => {
        let insertWin = new BrowserWindow({
            width: 600,
            height: 200,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
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
