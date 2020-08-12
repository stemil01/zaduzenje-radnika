const ejsElectron = require('ejs-electron');

const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/zaduzenje_radnika.db', (err) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log('Connected to the database');
    }
});

db.serialize(() => {
    // ovde treba da formiras bazu
    // znaci sve tabele i relacije
    // POGLEDAJ AKO POSTOJI NEKI BOLJI NACIN OD OVOGA

    // proveri za INT PRIMARY KEY mozda ga ne uvecava automatski,
    // promeni mozda na INTEGER PRIMARY KEY
    db.run(`CREATE TABLE IF NOT EXISTS Artikl (
        ID_Artikla INTEGER PRIMARY KEY,
        SifraArtikla INT UNIQUE NOT NULL,
        Naziv NCHAR(100) NOT NULL,
        JedinicaMere NCHAR(20) NOT NULL,
        Cena FLOAT NOT NULL CHECK(Cena >= 0),
        UkupnaKolicina FLOAT NOT NULL DEFAULT 0 CHECK(UkupnaKolicina >= 0)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Radnik (
        ID_Radnika INTEGER PRIMARY KEY,
        PrezimeIme NCHAR(100) NOT NULL,
        UkupnoZaduzenje FLOAT NOT NULL DEFAULT 0 CHECK(UkupnoZaduzenje >= 0)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Ulaz (
        ID_Ulaza INTEGER PRIMARY KEY,
        ID_Artikla INTEGER NOT NULL,
        Kolicina FLOAT NOT NULL CHECK(Kolicina >= 0),
        Datum DATE NOT NULL,
        FOREIGN KEY (ID_Artikla)
            REFERENCES Artikl (ID_Artikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Zaduzenje (
        ID_Zaduzenja INTEGER PRIMARY KEY,
        ID_Radnika INTEGER NOT NULL,
        ID_Artikla INTEGER NOT NULL,
        Kolicina FLOAT NOT NULL CHECK(Kolicina >= 0),
        Datum DATE NOT NULL,
        FOREIGN KEY (ID_Radnika)
            REFERENCES Radnik (ID_Radnika),
        FOREIGN KEY (ID_Artikla)
            REFERENCES Artikl (ID_Artikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS ZaduzenjePoRadniku (
        ID_Radnika INTEGER,
        ID_Artikla INTEGER,
        Kolicina FLOAT NOT NULL DEFAULT 0 CHECK(Kolicina >= 0),
        PRIMARY KEY (ID_Radnika, ID_Artikla)
        FOREIGN KEY (ID_Radnika)
            REFERENCES Radnik (ID_Radnika)
        FOREIGN KEY (ID_Artikla)
            REFERENCES Artikl (ID_Artikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Razduzenje (
        ID_Razduzenja INTEGER PRIMARY KEY,
        ID_Radnika INTEGER NOT NULL,
        ID_Artikla INTEGER NOT NULL,
        Kolicina FLOAT NOT NULL CHECK(Kolicina >= 0),
        FOREIGN KEY (ID_Radnika)
            REFERENCES Radnik (ID_Radnika),
        FOREIGN KEY (ID_Artikla)
            REFERENCES Artikl (ID_Artikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    })
});

module.exports = { db };

// mozda ovo ne treba da bude ovde, nego tek kasnije
// db.close();
