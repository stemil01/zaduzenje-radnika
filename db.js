const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/zaduzenje_radnika.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the database');
});

db.serialize(() => {
    // ovde treba da formiras bazu
    // znaci sve tabele i relacije
    // POGLEDAJ AKO POSTOJI NEKI BOLJI NACIN OD OVOGA
    db.run('CREATE TABLE IF NOT EXISTS artikli (ID_artikla INT PRIMARY KEY, naziv_artikla NCHAR(60) NOT NULL, jedinica_mere NCHAR(20) NOT NULL, cena FLOAT NOT NULL )');
});

function insertArtikli(record) {

}

// close the database connection
db.close();
