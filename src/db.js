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
        SifraArtikla INT PRIMARY KEY,
        Naziv NCHAR(100) NOT NULL,
        JedinicaMere NCHAR(20) NOT NULL,
        Cena FLOAT NOT NULL,
        UkupnaKolicina FLOAT NOT NULL DEFAULT 0
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Radnik (
        ID_Radnika INT PRIMARY KEY,
        PrezimeIme NCHAR(100) NOT NULL,
        UkupnoZaduzenje FLOAT NOT NULL DEFAULT 0
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Ulaz (
        ID_Ulaza INT PRIMARY KEY,
        SifraArtikla INT NOT NULL,
        Kolicina FLOAT NOT NULL,
        FOREIGN KEY (SifraArtikla)
            REFERENCES Artikl (SifraArtikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Zaduzenje (
        ID_Zaduzenja INT PRIMARY KEY,
        ID_Radnika INT NOT NULL,
        SifraArtikla INT NOT NULL,
        Kolicina FLOAT NOT NULL,
        Datum DATE NOT NULL,
        FOREIGN KEY (ID_Radnika)
            REFERENCES Radnik (ID_Radnika),
        FOREIGN KEY (SifraArtikla)
            REFERENCES Artikl (SifraArtikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS ZaduzenjePoRadniku (
        ID_Radnika INT,
        SifraArtikla INT,
        Kolicina FLOAT NOT NULL DEFAULT 0,
        PRIMARY KEY (ID_Radnika, SifraArtikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS Razduzenje (
        ID_Razduzenja INT PRIMARY KEY,
        ID_Radnika INT NOT NULL,
        SifraArtikla INT NOT NULL,
        Kolicina FLOAT NOT NULL,
        FOREIGN KEY (ID_Radnika)
            REFERENCES Radnik (ID_Radnika),
        FOREIGN KEY (SifraArtikla)
            REFERENCES Artikl (SifraArtikla)
    )`, (err) => {
        if (err) {
            console.log(err);
        }
    })
});

async function list_Artikl() {
    db.all(`SELECT *
            FROM Artikl`, (err, rows) => {
                if (err) {
                    throw err;
                }
                console.log('1');
                return rows;
            });
    console.log('2');
}

module.exports = { db, list_Artikl };

// mozda ovo ne treba da bude ovde, nego tek kasnije
// db.close();
