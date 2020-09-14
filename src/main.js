const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ejse = require('ejs-electron');
const database = require('./db.js');
const { data } = require('ejs-electron');
const { render } = require('ejs');
const db = require('./db.js');

app.on('ready', () => {
    const win = new BrowserWindow({
        width: 1400,
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
            SELECT JedinicaMere, UkupnaKolicina
            FROM Artikl
            WHERE ID_Artikla=?
            `, ID_Artikla, (err, row) => {
                if (err) {
                    throw err;
                }
                event.sender.send("JedinicaMere", row);
            });
    });

    ipcMain.on("insert-Ulaz", (evt, ID_Artikla, Kolicina, Datum) => {
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

    ipcMain.on("delete-Ulaz", (evt, ID_Ulaza) => {
        database.db.run(`UPDATE Artikl
                        SET UkupnaKolicina=ROUND(UkupnaKolicina - (
                            SELECT Kolicina
                            FROM Ulaz
                            WHERE ID_Ulaza=?
                        ), 3)
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
        database.db.run(`UPDATE Artikl
                        SET UkupnaKolicina=ROUND(UkupnaKolicina + ?, 3)
                        WHERE SifraArtikla=?`, [Kolicina, SifraArtikla], (err) => {
                            if (err) {
                                throw err;
                            } else {
                                database.db.run(`UPDATE Artikl
                                                SET UkupnaKolicina=ROUND(UkupnaKolicina - ?, 3)
                                                WHERE SifraArtikla=?`, [prev_Kolicina, prev_SifraArtikla], (err) => {
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

    // ipcMain.on("search-Ulaz", (evt, key, searchBy) => {
    //     database.db.all(`SELECT U.ID_Ulaza, A.SifraArtikla, A.Naziv, A.JedinicaMere, U.Kolicina, strftime('%d.%m.%Y.', U.Datum) Datum
    //                     FROM Ulaz U, Artikl A
    //                     WHERE A.ID_Artikla=U.ID_Artikla AND ${searchBy} LIKE '%${key}%'
    //                     ORDER BY U.Datum DESC`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("search-result-Ulaz", rows);
    //                     });
    // });

    // ipcMain.on("sort-Ulaz", (evt, attribute, desc, key, searchBy) => {
    //     let sort = desc ? 'DESC' : 'ASC';
    //     database.db.all(`SELECT U.ID_Ulaza, A.SifraArtikla, A.Naziv, A.JedinicaMere, U.Kolicina, strftime('%d.%m.%Y.', U.Datum) Datum
    //                     FROM Ulaz U, Artikl A
    //                     WHERE A.ID_Artikla=U.ID_Artikla AND ${searchBy} LIKE '%${key}%'
    //                     ORDER BY ${attribute} ${sort}`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("sort-rows-Ulaz", rows);
    //                     });
    // });

    // SKLADISTE
    ipcMain.on("list-Skladiste", () => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena, UkupnaKolicina, ROUND(Cena*UkupnaKolicina, 3) Vrednost
            FROM Artikl
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

    // ipcMain.on("sort-Skladiste", (evt, attribute, desc, key, searchBy) => {
    //     let sort = desc ? 'DESC' : 'ASC';
    //     database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena, UkupnaKolicina, Cena*UkupnaKolicina Vrednost
    //                     FROM Artikl
    //                     WHERE ${searchBy} LIKE '%${key}%'
    //                     ORDER BY ${attribute} ${sort}`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("sort-rows-Skladiste", rows);
    //                     });
    // });

    // ipcMain.on("search-Skladiste", (evt, key, searchBy) => {
    //     database.db.all(`SELECT ID_Artikla, SifraArtikla, Naziv, JedinicaMere, Cena, UkupnaKolicina, Cena*UkupnaKolicina Vrednost
    //                     FROM Artikl
    //                     WHERE ${searchBy} LIKE '%${key}%'`, (err, rows) => {
    //                         if (err) {
    //                             throw err;
    //                         }
    //                         win.webContents.send("search-result-Skladiste", rows);
    //                     });
    // });

    // ZADUZENJE
    ipcMain.on("list-Zaduzenje", () => {
        database.db.all(`SELECT Z.ID_Zaduzenja, R.PrezimeIme, A.SifraArtikla, A.Naziv, A.JedinicaMere, Z.Kolicina, Z.Datum
                        FROM Zaduzenje Z, Radnik R, Artikl A
                        WHERE Z.ID_Radnika=R.ID_Radnika AND Z.ID_Artikla=A.ID_Artikla
                        ORDER BY Z.Datum DESC`, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            win.webContents.send("rows-Zaduzenje", rows);
                        });
    });

    ipcMain.on("req-skladiste-SifraArtikla", (event) => {
        database.db.all(`
            SELECT ID_Artikla, SifraArtikla, Naziv
            FROM Artikl
            WHERE UkupnaKolicina>0
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-skladiste-SifraArtikla", rows);
        });
    });


    ipcMain.on("insert-Zaduzenje", (evt, ID_Radnika, ID_Artikla, Kolicina, Datum) => {
        database.db.run(`UPDATE Artikl
                        SET UkupnaKolicina=ROUND(UkupnaKolicina-?, 3)
                        WHERE ID_Artikla=?`, [Kolicina, ID_Artikla], (err) => {
                            if (err) {
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            } else {
                                database.db.run(`INSERT INTO ZaduzenjePoRadniku(ID_Radnika, ID_Artikla, Kolicina)
                                                VALUES(?, ?, ?)
                                                ON CONFLICT(ID_Radnika, ID_Artikla)
                                                DO UPDATE SET Kolicina=Kolicina+?`, [ID_Radnika, ID_Artikla, Kolicina, Kolicina], (err) => {
                                                    if (err) {
                                                        dialog.showErrorBox('Greska pri unosu podataka', err.message);
                                                    } else {
                                                        database.db.run(`INSERT INTO Zaduzenje(ID_Radnika, ID_Artikla, Kolicina, Datum)
                                                                        VALUES(?, ?, ?, ?)`, [ID_Radnika, ID_Artikla, Kolicina, Datum], (err) => {
                                                                            if (err) {
                                                                                dialog.showMessageBox('Greska pri unosu podataka', err.message);
                                                                            } else {
                                                                                win.reload();
                                                                            }
                                                                        });
                                                    }
                                                });
                            }
                        });
    });

    ipcMain.on("edit-Zaduzenje", (evt, ID_Zaduzenja, prev_PrezimeIme, prev_SifraArtikla, prev_Kolicina, PrezimeIme, SifraArtikla, Kolicina, Datum) => {
        let prev_ID_Radnika, prev_ID_Artikla, ID_Radnika, ID_Artikla;
        database.db.get(`SELECT ID_Radnika FROM Radnik WHERE PrezimeIme=?`, prev_PrezimeIme, (err, rows) => {
            if (err) {
                throw err;
            }
            prev_ID_Radnika = Object.values(rows)[0];
            database.db.get(`SELECT ID_Artikla FROM Artikl WHERE SifraArtikla=?`, prev_SifraArtikla, (err, rows) => {
                if (err) {
                    throw err;
                }
                prev_ID_Artikla = Object.values(rows)[0];
                database.db.get(`SELECT ID_Radnika FROM Radnik WHERE PrezimeIme=?`, PrezimeIme, (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    ID_Radnika = Object.values(rows)[0];
                    database.db.get(`SELECT ID_Artikla FROM Artikl WHERE SifraArtikla=?`, SifraArtikla, (err, rows) => {
                        if (err) {
                            throw err;
                        }
                        ID_Artikla = Object.values(rows)[0];
                        database.db.run(`
                            UPDATE Artikl
                            SET UkupnaKolicina=ROUND(UkupnaKolicina+?, 3)
                            WHERE SifraArtikla=?
                        `, [prev_Kolicina, prev_SifraArtikla], (err) => {
                            if (err) {
                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                            } else {
                                database.db.run(`
                                    UPDATE ZaduzenjePoRadniku
                                    SET Kolicina=ROUND(Kolicina-?, 3)
                                    WHERE ID_Radnika=? AND ID_Artikla=?
                                `, [prev_Kolicina, prev_ID_Radnika, prev_ID_Artikla], (err) => {
                                    if (err) {
                                        dialog.showErrorBox('Greska pri unosu podataka', err.message);
                                    } else {
                                        database.db.run(`
                                            UPDATE Artikl
                                            SET UkupnaKolicina=ROUND(UkupnaKolicina-?, 3)
                                            WHERE SifraArtikla=?
                                        `, [Kolicina, SifraArtikla], (err) => {
                                            if (err) {
                                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                                            } else {
                                                database.db.run(`
                                                    INSERT INTO ZaduzenjePoRadniku(ID_Radnika, ID_Artikla, Kolicina)
                                                    VALUES(?, ?, ?)
                                                    ON CONFLICT(ID_Radnika, ID_Artikla)
                                                    DO UPDATE SET Kolicina=ROUND(Kolicina+?, 3)
                                                `, [ID_Radnika, ID_Artikla, Kolicina, Kolicina], (err) => {
                                                    if (err) { 
                                                        dialog.showErrorBox('Greska pri unosu podataka', err.message);
                                                    } else {
                                                        database.db.run(`
                                                            UPDATE Zaduzenje
                                                            SET ID_Radnika=?, ID_Artikla=?, Kolicina=?, Datum=?
                                                            WHERE ID_Zaduzenja=?
                                                        `, [ID_Radnika, ID_Artikla, Kolicina, Datum, ID_Zaduzenja], (err) => {
                                                            if (err) {
                                                                dialog.showErrorBox('Greska pri unosu podataka', err.message);
                                                            } else {
                                                                win.webContents.send("edited-Zaduzenje");
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    });

    ipcMain.on("req-Naziv-JedinicaMere-UkupnaKolicina", (evt, SifraArtikla) => {
        database.db.get(`
            SELECT Naziv, JedinicaMere, UkupnaKolicina
            FROM Artikl
            WHERE SifraArtikla=?
        `, [SifraArtikla], (err, row) => {
            if (err) {
                throw err;
            }
            win.webContents.send("res-Naziv-JedinicaMere-UkupnaKolicina", row);
        });
    });

    ipcMain.on("delete-Zaduzenje", (evt, ID_Zaduzenja) => {
        let ID_Radnika, ID_Artikla, Kolicina;
        database.db.get(`
            SELECT ID_Radnika, ID_Artikla, Kolicina
            FROM Zaduzenje
            WHERE ID_Zaduzenja=?
        `, ID_Zaduzenja, (err, row) => {
            if (err) {
                throw err;
            }
            [ID_Radnika, ID_Artikla, Kolicina] = Object.values(row);
                
            database.db.run(`
                UPDATE Artikl
                SET UkupnaKolicina=ROUND(UkupnaKolicina+?, 3)
                WHERE ID_Artikla=?
            `, [Kolicina, ID_Artikla], (err) => {
                if (err) {
                    throw err;
                }
                database.db.run(`
                    UPDATE ZaduzenjePoRadniku
                    SET Kolicina=ROUND(Kolicina-?, 3)
                    WHERE ID_Radnika=? AND ID_Artikla=?
                `, [Kolicina, ID_Radnika, ID_Artikla], (err) => {
                    if (err) {
                        throw err;
                    }
                    database.db.run(`
                        DELETE FROM Zaduzenje
                        WHERE ID_Zaduzenja=?
                    `, ID_Zaduzenja, (err) => {
                        if (err) {
                            throw err;
                        }
                        win.webContents.send("deletedRow");
                    });
                });
            });
        });
    });

    // RAZDUZENJE
    ipcMain.on("req-zaduzen-Radnik", (event) => {
        database.db.all(`
            SELECT DISTINCT R.ID_Radnika, R.PrezimeIme
            FROM Radnik R, ZaduzenjePoRadniku ZR
            WHERE R.ID_Radnika=ZR.ID_Radnika AND ZR.Kolicina>0
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-zaduzen-Radnik", rows);
        });
    });

    ipcMain.on("req-zaduzen-Artikl", (event) => {
        database.db.all(`
            SELECT DISTINCT A.ID_Artikla, A.SifraArtikla, A.Naziv
            FROM Artikl A, ZaduzenjePoRadniku ZR
            WHERE A.ID_Artikla=ZR.ID_Artikla AND ZR.Kolicina>0
        `, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-zaduzen-Artikl", rows);
        });
    });

    ipcMain.on("req-Artikl-zaRadnik", (event, ID_Radnika) => {
        database.db.all(`
            SELECT DISTINCT A.ID_Artikla, A.SifraArtikla, A.Naziv
            FROM Artikl A, ZaduzenjePoRadniku ZR
            WHERE A.ID_Artikla=ZR.ID_Artikla AND ZR.ID_Radnika=? AND ZR.Kolicina>0
        `, ID_Radnika, (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-Artikl-zaRadnik", rows);
        });
    });

    ipcMain.on("req-ZaduzenjePoRadniku", (event, ID_Radnika, ID_Artikla) => {
        database.db.get(`
            SELECT Kolicina
            FROM ZaduzenjePoRadniku
            WHERE ID_Radnika=? AND ID_Artikla=?
        `, [ID_Radnika, ID_Artikla], (err, row) => {
            if (err) {
                throw err;
            }
            event.sender.send("res-ZaduzenjePoRadniku", row);
        });
    });

    // ZADUZENJE PO RADNIKU
    ipcMain.on("list-Radnik-Zaduzenje", (evt, PrezimeIme) => {
        database.db.get(`
            SELECT ID_Radnika
            FROM Radnik
            WHERE PrezimeIme=?
        `, PrezimeIme, (err, row) => {
            if (err) {
                throw err;
            }
            let [ID_Radnika] = Object.values(row);
            database.db.all(`
                SELECT '', A.SifraArtikla, A.Naziv, A.JedinicaMere, ZR.Kolicina, ROUND(A.Cena*ZR.Kolicina, 3) [Vrednost]
                FROM Artikl A, ZaduzenjePoRadniku ZR
                WHERE A.ID_Artikla=ZR.ID_Artikla AND ZR.ID_Radnika=? AND ZR.Kolicina>0
            `, ID_Radnika, (err, rows) => {
                if (err) {
                    throw err;
                }
                win.webContents.send("Radnik-Zaduzenje", rows);
            });
        });
    });

    ipcMain.on("req-ukupno-zaduzenje", (evt, ID_Radnika) => {
        database.db.get(`
            SELECT ROUND(SUM(ROUND(A.Cena*ZR.Kolicina, 3)), 3)
            FROM Artikl A, ZaduzenjePoRadniku ZR
            WHERE A.ID_Artikla=ZR.ID_Artikla AND ZR.ID_Radnika=?
        `, ID_Radnika, (err, row) => {
            if (err) {
                throw err;
            }
            win.webContents.send("res-ukupno-zaduzenje", Object.values(row)[0]);
        });
    });

    // ipcMain.on("req-Radnik-zaArtikl", (event, ID_Artikla) => {
    //     database.db.all(`
    //         SELECT DISTINCT R.ID_Radnika, R.PrezimeIme
    //         FROM Radnik R, ZaduzenjePoRadniku ZR
    //         WHERE R.ID_Radnika=ZR.ID_Radnika AND ZR.ID_Artikla=? AND ZR.Kolicina>0
    //     `, ID_Artikla, (err, rows) => {
    //         if (err) {
    //             throw err;
    //         }
    //         event.sender.send("res-Radnik-zaArtikl", rows);
    //     });
    // });

    ipcMain.on("insert-Razduzenje", (evt, ID_Radnika, ID_Artikla, Kolicina, Datum) => {
        database.db.run(`
            UPDATE ZaduzenjePoRadniku
            SET Kolicina=ROUND(Kolicina-?, 3)
            WHERE ID_Radnika=? AND ID_Artikla=?
        `, [Kolicina, ID_Radnika, ID_Artikla], (err) => {
            if (err) {
                dialog.showErrorBox('Greska pri unosu podataka', err.message);
            } else {
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
            UPDATE ZaduzenjePoRadniku
            SET Kolicina=ROUND(Kolicina+?, 3)
            WHERE ID_Radnika=? AND ID_Artikla=?
        `, [prev_Kolicina, prev_ID_Radnika, prev_ID_Artikla], (err) => {
            if (err) {
                dialog.showErrorBox('Greska pri unosu podataka', err.message);
            } else {
                database.db.run(`
                    UPDATE ZaduzenjePoRadniku
                    SET Kolicina=ROUND(Kolicina-?, 3)
                    WHERE ID_Radnika=? AND ID_Artikla=?
                `, [Kolicina, ID_Radnika, ID_Artikla], (err) => {
                    if (err) {
                        dialog.showErrorBox('Greska pri unosu podataka', err.message);
                    } else {
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
                        })
                    }
                })
            }
        });
    });

    ipcMain.on("delete-Razduzenje", (evt, ID_Razduzenja) => {
        database.db.get(`
            SELECT ID_Radnika, ID_Artikla, Kolicina
            FROM Razduzenje
            WHERE ID_Razduzenja=?
        `, ID_Razduzenja, (err, row) => {
            if (err) {
                throw err;
            }
            let [ID_Radnika, ID_Artikla, Kolicina] = Object.values(row);
            database.db.run(`
                UPDATE ZaduzenjePoRadniku
                SET Kolicina=ROUND(Kolicina+?, 3)
                WHERE ID_Radnika=? AND ID_Artikla=?
            `, [Kolicina, ID_Radnika, ID_Artikla], (err) => {
                if (err) {
                    throw err;
                }
                database.db.run(`
                    DELETE FROM Razduzenje
                    WHERE ID_Razduzenja=?
                `, ID_Razduzenja, (err) => {
                    if (err) {
                        throw err;
                    }
                    win.webContents.send("deletedRow");
                })
            })
        });
    });

    // OPSTE
    ipcMain.on("open-insert-window", (evt, path) => {
        let insertWin = new BrowserWindow({
            width: 600,
            height: 300,
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
