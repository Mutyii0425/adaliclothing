import express from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config({ path: './backend.env' });


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
    const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Ez az email már regisztrálva van!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO user (felhasznalonev, email, jelszo) VALUES (?, ?, ?)', [name, email, hashedPassword]);

   
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
    if (rows.length > 0) {
      const user = rows[0];
      return res.json({ 
        success: true,
        message: 'Sikeres bejelentkezés!',
        user: {
          username: user.felhasznalonev,
          email: user.email,
          f_azonosito: user.f_azonosito  
        }
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Szerver hiba!' });
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
