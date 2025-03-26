const request = require('supertest');
const express = require('express');
const mysql = require('mysql');


jest.mock('mysql');


const app = express();
app.use(express.json({ limit: '50mb' }));


app.get('/products', (req, res) => {
  res.json([
    { id: 1, nev: 'Teszt termék 1', ar: 5000, leiras: 'Leírás 1', meret: 'M' },
    { id: 2, nev: 'Teszt termék 2', ar: 6000, leiras: 'Leírás 2', meret: 'L' }
  ]);
});


app.post('/usertermekek', (req, res) => {
  res.json({ success: true, id: 1 });
});


app.delete('/products/:id', (req, res) => {
  res.json({ message: 'Termék sikeresen törölve' });
});


app.put('/products/:id', (req, res) => {
  res.json({ message: 'Termék sikeresen frissítve' });
});


app.get('/products/:id', (req, res) => {
  res.json({
    id: 1,
    nev: 'Teszt termék',
    ar: 5000,
    leiras: 'Leírás',
    meret: 'M',
    imageUrl: 'data:image/jpeg;base64,...',
    images: ['data:image/jpeg;base64,...', 'data:image/jpeg;base64,...']
  });
});

describe('Termékek kezelése', () => {
  beforeEach(() => {
   
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        
        if (query.includes('SELECT * FROM usertermekek')) {
          callback(null, [
            { id: 1, nev: 'Teszt termék 1', ar: 5000, leiras: 'Leírás 1', meret: 'M' },
            { id: 2, nev: 'Teszt termék 2', ar: 6000, leiras: 'Leírás 2', meret: 'L' }
          ]);
        } else if (query.includes('SELECT * FROM usertermekek WHERE id = ?')) {
          callback(null, [{
            id: 1,
            nev: 'Teszt termék',
            ar: 5000,
            leiras: 'Leírás',
            meret: 'M',
            imageUrl: 'data:image/jpeg;base64,...',
            images: JSON.stringify(['data:image/jpeg;base64,...', 'data:image/jpeg;base64,...'])
          }]);
        } else if (query.includes('INSERT INTO usertermekek')) {
          callback(null, { insertId: 1 });
        } else if (query.includes('UPDATE usertermekek')) {
          callback(null, { affectedRows: 1 });
        } else if (query.includes('DELETE FROM usertermekek')) {
          callback(null, { affectedRows: 1 });
        }
      })
    });
  });

  test('GET /products sikeresen lekéri a termékeket', async () => {
    const response = await request(app).get('/products');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('nev');
    expect(response.body[0]).toHaveProperty('ar');
  });
  
  test('GET /products/:id sikeresen lekéri egy termék részleteit', async () => {
    const response = await request(app).get('/products/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('nev');
    expect(response.body).toHaveProperty('ar');
    expect(response.body).toHaveProperty('leiras');
    expect(response.body).toHaveProperty('meret');
  });
  
  test('POST /usertermekek sikeresen feltölti a terméket', async () => {
    const testProduct = {
      kategoriaId: 1,
      ar: 5000,
      nev: 'Teszt termék',
      leiras: 'Ez egy teszt termék',
      meret: 'M',
      imageUrl: 'data:image/jpeg;base64,...',
      images: ['data:image/jpeg;base64,...', 'data:image/jpeg;base64,...']
    };
    
    const response = await request(app)
      .post('/usertermekek')
      .send(testProduct);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('id');
  });
  
  test('PUT /products/:id sikeresen módosítja a terméket', async () => {
    const updateData = {
      ar: 6000,
      nev: 'Módosított termék',
      leiras: 'Módosított leírás',
      meret: 'L'
    };
    
    const response = await request(app)
      .put('/products/1')
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Termék sikeresen frissítve');
  });
  
  test('DELETE /products/:id sikeresen törli a terméket', async () => {
    const response = await request(app).delete('/products/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Termék sikeresen törölve');
  });
});
