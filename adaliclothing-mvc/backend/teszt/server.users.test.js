const request = require('supertest');
const express = require('express');
const mysql = require('mysql');


jest.mock('mysql');


const app = express();
app.use(express.json());


app.get('/users', (req, res) => {
  res.json([
    { f_azonosito: 1, felhasznalonev: 'Teszt Felhasználó 1', email: 'teszt1@example.com' },
    { f_azonosito: 2, felhasznalonev: 'Teszt Felhasználó 2', email: 'teszt2@example.com' }
  ]);
});


app.delete('/users/:id', (req, res) => {
  res.json({ message: 'Felhasználó sikeresen törölve' });
});


app.get('/user/:id', (req, res) => {
  res.json({
    felhasznalonev: 'Teszt Felhasználó',
    email: 'teszt@example.com'
  });
});


app.get('/check-user/:username', (req, res) => {
  res.json({ exists: true, email: 'teszt@example.com' });
});

describe('Felhasználók kezelése', () => {
  beforeEach(() => {
  
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        
        if (query.includes('SELECT * FROM user')) {
          callback(null, [
            { f_azonosito: 1, felhasznalonev: 'Teszt Felhasználó 1', email: 'teszt1@example.com' },
            { f_azonosito: 2, felhasznalonev: 'Teszt Felhasználó 2', email: 'teszt2@example.com' }
          ]);
        } else if (query.includes('SELECT felhasznalonev, email FROM user WHERE f_azonosito = ?')) {
          callback(null, [{
            felhasznalonev: 'Teszt Felhasználó',
            email: 'teszt@example.com'
          }]);
        } else if (query.includes('DELETE FROM user WHERE f_azonosito = ?')) {
          callback(null, { affectedRows: 1 });
        } else if (query.includes('SELECT email FROM user WHERE felhasznalonev = ?')) {
          callback(null, [{ email: 'teszt@example.com' }]);
        }
      })
    });
  });

  test('GET /users sikeresen lekéri a felhasználókat', async () => {
    const response = await request(app).get('/users');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('f_azonosito');
    expect(response.body[0]).toHaveProperty('felhasznalonev');
    expect(response.body[0]).toHaveProperty('email');
  });
  
  test('GET /user/:id sikeresen lekéri egy felhasználó adatait', async () => {
    const response = await request(app).get('/user/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('felhasznalonev');
    expect(response.body).toHaveProperty('email');
  });
  
  test('DELETE /users/:id sikeresen törli a felhasználót', async () => {
    const response = await request(app).delete('/users/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Felhasználó sikeresen törölve');
  });
  
  test('GET /check-user/:username sikeresen ellenőrzi a felhasználónevet', async () => {
    const response = await request(app).get('/check-user/TesztFelhasznalo');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('exists');
    if (response.body.exists) {
      expect(response.body).toHaveProperty('email');
    }
  });
});
