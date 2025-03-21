import express from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config({ path: './backend.env' });

app.get('/', (req, res) => {
  res.send('Adali Clothing API server is running');
});

const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'webshoppp',
  password: process.env.DB_PASS || 'Premo900',
  database: process.env.DB_NAME || 'webshoppp'
});

console.log('Connected to database');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);


app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if email already exists
    const [emailUsers] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (emailUsers.length > 0) {
      return res.status(400).json({ error: 'Ez az email már regisztrálva van a rendszerben.' });
    }
    
    // Check if username already exists
    const [nameUsers] = await db.execute('SELECT * FROM user WHERE felhasznalonev = ?', [name]);
    if (nameUsers.length > 0) {
      return res.status(400).json({ error: 'Ez a felhasználónév már foglalt.' });
    }
    
    // Validate email format
    if (email.split('@').length !== 2) {
      return res.status(400).json({ error: 'Az email cím formátuma nem megfelelő!' });
    }
    
    // Validate password requirements
    if (password.length < 6 || !/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'A jelszónak legalább 6 karakterből kell állnia és tartalmaznia kell legalább egy nagybetűt!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO user (felhasznalonev, email, jelszo) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    // Email sending code remains the same...
    const msg = {
      to: email,
      from: {
        name: 'Adali Clothing',
        email: 'adaliclothing@gmail.com'
      },
      subject: 'Sikeres regisztráció - Adali Clothing',
      html: `
        <h2>Kedves ${name}!</h2>
        <p>Köszönjük, hogy regisztráltál az Adali Clothing oldalán!</p>
        <p>Sikeres regisztrációdat ezúton visszaigazoljuk.</p>
        <p>Üdvözlettel,<br>Az Adali Clothing csapata</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Registration confirmation email sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError.response?.body);     
    }

    res.status(201).json({ 
      message: 'Sikeres regisztráció!',
      user: {
        username: name,
        email: email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Adatbázis hiba!' });
  }
});




app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'Hibás email vagy jelszó!',
        errorType: 'invalid_credentials'
      });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.jelszo);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Hibás email vagy jelszó!',
        errorType: 'invalid_credentials'
      });
    }

    return res.json({ 
      success: true,
      message: 'Sikeres bejelentkezés!',
      user: {
        username: user.felhasznalonev,
        email: user.email,
        f_azonosito: user.f_azonosito  
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Szerver hiba!',
      errorType: 'server_error'
    });
  }
});



app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/send-confirmation', async (req, res) => {
  const { email, name, orderId, orderItems, shippingDetails, totalPrice, discount, shippingCost } = req.body;
  
  const orderItemsList = orderItems.map(item => 
    `<tr>
      <td>${item.nev} - Méret: ${item.size}</td>
      <td>${item.mennyiseg} db</td>
      <td>${item.ar.toLocaleString()} Ft</td>
      <td>${(item.ar * item.mennyiseg).toLocaleString()} Ft</td>
    </tr>`
  ).join('');

  const msg = {
    to: email,
    from: {
      name: 'Adali Clothing',
      email: 'adaliclothing@gmail.com'
    },
    subject: 'Rendelés visszaigazolás - Adali Clothing',
    html: `
      <h2>Kedves ${name}!</h2>
      <p>Köszönjük a rendelését! Az alábbiakban találja a rendelés részleteit.</p>
      
      <h3>Rendelési azonosító: #${orderId}</h3>
      
      <h4>Rendelt termékek:</h4>
      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <th>Termék</th>
          <th>Mennyiség</th>
          <th>Egységár</th>
          <th>Részösszeg</th>
        </tr>
        ${orderItemsList}
      </table>

      <h4>Szállítási adatok:</h4>
      <p>
        Név: ${name}<br>
        Telefonszám: ${shippingDetails.phoneNumber}<br>
        Cím: ${shippingDetails.zipCode} ${shippingDetails.city}, ${shippingDetails.address}
      </p>

      
      <p>
  Részösszeg: ${(totalPrice - shippingCost).toLocaleString()} Ft<br>
  Kedvezmény: ${discount.toLocaleString()} Ft<br>
  Szállítási költség: ${shippingCost.toLocaleString()} Ft<br>
  <strong>Fizetendő összeg: ${(totalPrice - discount).toLocaleString()} Ft</strong>
</p>

    `
  };

  try {
    console.log('Sending confirmation email...');
    const result = await sgMail.send(msg);
    console.log('Email sent successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error.response?.body);
    res.status(500).json({ 
      error: 'Email sending failed',
      details: error.response?.body?.errors 
    });
  }
});

app.post('/save-rating', (req, res) => {
  console.log('Beérkezett adatok:', req.body); 
  
  const { rating, email, velemeny } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  db.query('SELECT f_azonosito FROM user WHERE email = ?', [email], (err, userResult) => {
    if (err) {
      console.log('User lekérés hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }

    const userId = userResult[0].f_azonosito;
    console.log('User ID:', userId); 

    db.query(
      'INSERT INTO ratings (f_azonosito, rating, velemeny, date) VALUES (?, ?, ?, ?)',
      [userId, rating, velemeny, currentDate],
      (err, result) => {
        if (err) {
          console.log('Mentési hiba:', err);
          return res.status(500).json({ error: 'Mentési hiba' });
        }
        res.json({ success: true });
      }
    );
  });
});



const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 



app.post('/update-coupon', async (req, res) => {
  const { email, coupon } = req.body;
  
  try {
    await db.execute(
      'UPDATE user SET kupon = ? WHERE email = ?',
      [coupon, email]
    );
    
    res.json({ 
      success: true,
      message: 'Kupon sikeresen elmentve'
    });
  } catch (error) {
    console.error('Coupon update error:', error);
    res.status(500).json({ error: 'Kupon mentési hiba' });
  }
});


app.post('/api/update-order-stats', async (req, res) => {
  const { userId, orderAmount, orderDate } = req.body;
  
  try {
    const [orders] = await db.execute(`
      SELECT r.*, t.ar 
      FROM rendeles r
      LEFT JOIN termekek t ON r.termek = t.id
      WHERE r.vevo_id = ?
    `, [userId]);

    const stats = {
      totalOrders: orders.length + 1,
      totalAmount: orders.reduce((sum, order) => sum + (order.ar * order.mennyiseg), 0) + orderAmount,
      lastOrderDate: orderDate
    };

    res.json(stats);
  } catch (error) {
    console.log('Hiba:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});




// Jelszó-visszaállítási kérelem végpont
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Ellenőrizzük, hogy létezik-e a felhasználó ezzel az email címmel
    const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'Nem található felhasználó ezzel az email címmel.',
        errorType: 'user_not_found'
      });
    }

    await db.execute(
      'UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE reset_expires < NOW()'
    );
    
    // Töröljük a meglévő tokent a felhasználótól, ha van
    await db.execute(
      'UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE email = ?',
      [email]
    );

    // Generálunk egy egyedi tokent a jelszó visszaállításhoz
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' ');
    console.log('Token expiry time set to:', resetExpires);
    
    // Mentjük a tokent és a lejárati időt az adatbázisba
    await db.execute(
      'UPDATE user SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [resetToken, resetExpires, email]
    );

    
    // Küldünk egy emailt a jelszó visszaállítási linkkel
    const msg = {
      to: email,
      from: {
        name: 'Adali Clothing',
        email: 'adaliclothing@gmail.com'
      },
      subject: 'Jelszó visszaállítás - Adali Clothing',
      html: `
        <h2>Jelszó visszaállítás</h2>
        <p>A jelszavad visszaállításához kattints az alábbi linkre:</p>
        <a href="http://localhost:3000/reset-password/${resetToken}">Jelszó visszaállítása</a>
        <p>Ez a link 1 óráig érvényes.</p>
        <p>Ha nem te kérted a jelszó visszaállítását, hagyd figyelmen kívül ezt az emailt.</p>
        <p>Üdvözlettel,<br>Az Adali Clothing csapata</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Password reset email sent successfully');
      res.json({ 
        success: true,
        message: 'A jelszó visszaállítási email elküldve.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError.response?.body);
      res.status(500).json({ 
        error: 'Nem sikerült elküldeni a jelszó visszaállítási emailt.',
        errorType: 'email_error'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Szerver hiba történt.',
      errorType: 'server_error'
    });
  }
});

app.post('/reset-password', async (req, res) => {
  console.log('Reset password request received');
  console.log('Request body:', req.body);
  
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    console.log('Missing token or password');
    return res.status(400).json({ 
      error: 'Hiányzó token vagy jelszó.',
      errorType: 'missing_data'
    });
  }
  
  try {
    // Először ellenőrizzük, hogy a token egyáltalán létezik-e
    const [allTokens] = await db.execute(
      'SELECT * FROM user WHERE reset_token = ?',
      [token]
    );
    
    console.log('Token exists in database:', allTokens.length > 0);
    
    if (allTokens.length === 0) {
      return res.status(400).json({ 
        error: 'Érvénytelen jelszó-visszaállítási token.',
        errorType: 'invalid_token'
      });
    }
    
    // Majd ellenőrizzük, hogy a token nem járt-e le
    const [validTokens] = await db.execute(
      'SELECT * FROM user WHERE reset_token = ? AND reset_expires > DATE_SUB(NOW(), INTERVAL 10 MINUTE)',
      [token]
    );
    
    console.log('Token is valid and not expired:', validTokens.length > 0);
    
    if (validTokens.length === 0) {
      const user = allTokens[0];
      console.log('Token expired at:', user.reset_expires);
      console.log('Current time:', new Date());
      
      return res.status(400).json({ 
        error: 'Lejárt jelszó-visszaállítási token.',
        errorType: 'expired_token'
      });
    }
    
    // Ellenőrizzük az új jelszó követelményeit
    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword)) {
      console.log('Invalid password format');
      return res.status(400).json({ 
        error: 'A jelszónak legalább 6 karakterből kell állnia és tartalmaznia kell legalább egy nagybetűt!',
        errorType: 'invalid_password'
      });
    }
    
    // Hasheljük az új jelszót és frissítjük az adatbázist
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute(
      'UPDATE user SET jelszo = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
      [hashedPassword, token]
    );
    
    console.log('Password successfully updated for user:', validTokens[0].felhasznalonev);
    
    res.json({ 
      success: true,
      message: 'A jelszó sikeresen frissítve.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Szerver hiba történt.',
      errorType: 'server_error'
    });
  }
});


async function checkAndFixDatabaseSchema() {
  try {
    // Ellenőrizzük, hogy léteznek-e a szükséges oszlopok
    const [columns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_token'");
    
    if (columns.length === 0) {
      // Ha nem létezik a reset_token oszlop, hozzáadjuk
      await db.execute("ALTER TABLE user ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL");
      console.log("Added reset_token column to user table");
    }
    
    const [expiryColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_expires'");
    
    if (expiryColumns.length === 0) {
      // Ha nem létezik a reset_expires oszlop, hozzáadjuk
      await db.execute("ALTER TABLE user ADD COLUMN reset_expires DATETIME DEFAULT NULL");
      console.log("Added reset_expires column to user table");
    }

    
    // Töröljük a lejárt tokeneket
    await db.execute("UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE reset_expires < NOW()");
    console.log("Cleaned up expired tokens");
    
    return true;
  } catch (error) {
    console.error("Database schema check error:", error);
    return false;
  }
}

// Hívjuk meg a függvényt a szerver indításakor
checkAndFixDatabaseSchema()
  .then(success => {
    if (success) {
      console.log("Database schema check completed successfully");
    } else {
      console.error("Database schema check failed");
    }
  });