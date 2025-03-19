const mysql = require('mysql2');

// MySQL adatbázis kapcsolat konfiguráció
const db = mysql.createConnection({
  host: 'localhost',        // Adatbázis hosztja
  user: 'webshoppp',        // Adatbázis felhasználónév
  password: 'Premo900',     // Adatbázis jelszó
  database: 'webshoppp',    // Adatbázis neve
});

// Kapcsolódás ellenőrzése
db.connect((err) => {
  if (err) {
    console.error('Hiba az adatbázis kapcsolódás során:', err.message);
    return;
  }
  console.log('Sikeresen csatlakoztál a webshopp adatbázishoz!');
});

module.exports = db;