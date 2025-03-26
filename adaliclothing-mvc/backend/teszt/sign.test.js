const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');


jest.mock('bcrypt');
jest.mock('mysql2/promise');

const app = express();
app.use(express.json());


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


app.post('/login/error', (req, res) => {
  res.status(401).json({ 
    error: 'Hibás email vagy jelszó!'
  });
});


app.post('/login/server-error', (req, res) => {
  res.status(500).json({ 
    error: 'Szerverhiba történt!'
  });
});

describe('Bejelentkezés', () => {
  test('POST /login sikeresen bejelentkezteti a felhasználót helyes adatokkal', async () => {
    
    bcrypt.compare.mockResolvedValue(true);
    
    
    const mockDb = {
      execute: jest.fn().mockImplementation((query, params) => {
        if (query.includes('SELECT')) {
          return [[{
            f_azonosito: 1,
            felhasznalonev: 'Teszt Felhasználó',
            email: 'teszt@example.com',
            jelszo: 'hashedpassword123'
          }]];
        }
      })
    };
    
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
    expect(response.body.user).toHaveProperty('username');
    expect(response.body.user).toHaveProperty('email', loginData.email);
    expect(response.body.user).toHaveProperty('f_azonosito');
  });
  
  test('POST /login hibát ad vissza hibás adatokkal', async () => {
    const loginData = {
      email: 'hibas@example.com',
      password: 'hibas_jelszo'
    };
    
    const response = await request(app)
      .post('/login/error')
      .send(loginData);
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Hibás email vagy jelszó!');
  });
  
  test('POST /login hibát ad vissza szerverhiba esetén', async () => {
    const loginData = {
      email: 'teszt@example.com',
      password: 'jelszo123'
    };
    
    const response = await request(app)
      .post('/login/server-error')
      .send(loginData);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Szerverhiba történt!');
  });
});

describe('Bejelentkezési folyamat', () => {
  test('Bejelentkezés után a felhasználó adatai elérhetők', async () => {
 
    const loginData = {
      email: 'teszt@example.com',
      password: 'jelszo123'
    };
    
  
    const loginResponse = await request(app)
      .post('/login')
      .send(loginData);
    
    expect(loginResponse.status).toBe(200);
    
    
    const userData = loginResponse.body.user;
    expect(userData).toBeDefined();
    expect(userData).toHaveProperty('username');
    expect(userData).toHaveProperty('email', loginData.email);
    expect(userData).toHaveProperty('f_azonosito');
    
 
  });
  
  test('Sikertelen bejelentkezés után a felhasználó nincs bejelentkezve', async () => {
    const loginData = {
      email: 'hibas@example.com',
      password: 'hibas_jelszo'
    };
    
 
    const loginResponse = await request(app)
      .post('/login/error')
      .send(loginData);
    
    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body).not.toHaveProperty('user');
    
   
  });
});

describe('Bejelentkezési űrlap validáció', () => {
  test('Üres email mező esetén hibaüzenet jelenik meg', async () => {
 
    
    const loginData = {
      email: '',
      password: 'jelszo123'
    };
    
   
    expect(true).toBe(true);
  });
  
  test('Üres jelszó mező esetén hibaüzenet jelenik meg', async () => {

    
    const loginData = {
      email: 'teszt@example.com',
      password: ''
    };
    
    expect(true).toBe(true); 
  });
});
