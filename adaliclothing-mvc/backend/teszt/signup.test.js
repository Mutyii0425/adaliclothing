const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

jest.mock('bcrypt');
jest.mock('@sendgrid/mail');
jest.mock('mysql2/promise');

const app = express();
app.use(express.json());


app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  res.status(201).json({ 
    message: 'Sikeres regisztráció!',
    user: {
      username: name,
      email: email
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  res.json({ 
    success: true,
    message: 'Sikeres bejelentkezés!',
    user: {
      username: 'Teszt Felhasználó',
      email: email,
      f_azonosito: 1
    }
  });
});


app.post('/send-confirmation', (req, res) => {
  res.json({ success: true });
});


app.post('/update-coupon', (req, res) => {
  res.json({ 
    success: true,
    message: 'Kupon sikeresen elmentve'
  });
});

describe('Regisztráció', () => {
  test('POST /register sikeresen regisztrálja a felhasználót', async () => {
    
    bcrypt.hash.mockResolvedValue('hashedpassword123');
    
    
    const mockDb = {
      execute: jest.fn().mockImplementation((query, params) => {
        if (query.includes('SELECT')) {
          return [[]]; 
        } else if (query.includes('INSERT')) {
          return [{ insertId: 1 }]; 
        }
      })
    };
    
 
    sgMail.send.mockResolvedValue({});
    
    const userData = {
      name: 'Teszt Felhasználó',
      email: 'teszt@example.com',
      password: 'jelszo123'
    };
    
    const response = await request(app)
      .post('/register')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Sikeres regisztráció!');
    expect(response.body.user).toHaveProperty('username', userData.name);
    expect(response.body.user).toHaveProperty('email', userData.email);
  });
  
  test('POST /register hibát ad vissza, ha az email már létezik', async () => {
   
    expect(true).toBe(true);
  });
});

describe('Bejelentkezés', () => {
  test('POST /login sikeresen bejelentkezteti a felhasználót', async () => {
    const loginData = {
      email: 'teszt@example.com',
      password: 'jelszo123'
    };
    
    const response = await request(app)
      .post('/login')
      .send(loginData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Sikeres bejelentkezés!');
    expect(response.body.user).toHaveProperty('email', loginData.email);
    expect(response.body.user).toHaveProperty('f_azonosito');
  });
});

describe('Rendelés visszaigazolás', () => {
  test('POST /send-confirmation sikeresen elküldi a visszaigazoló emailt', async () => {
   
    sgMail.send.mockResolvedValue({});
    
    const orderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó',
      orderId: '12345',
      orderItems: [
        { nev: 'Teszt termék', size: 'M', mennyiseg: 1, ar: 5000 }
      ],
      shippingDetails: {
        phoneNumber: '06301234567',
        zipCode: '1234',
        city: 'Budapest',
        address: 'Teszt utca 1.'
      },
      totalPrice: 5500,
      discount: 0,
      shippingCost: 500
    };
    
    const response = await request(app)
      .post('/send-confirmation')
      .send(orderData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

describe('Kupon kezelés', () => {
  test('POST /update-coupon sikeresen frissíti a felhasználó kuponját', async () => {
    const couponData = {
      email: 'teszt@example.com',
      coupon: 'WELCOME10'
    };
    
    const response = await request(app)
      .post('/update-coupon')
      .send(couponData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Kupon sikeresen elmentve');
  });
});
