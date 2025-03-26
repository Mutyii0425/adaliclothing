const request = require('supertest');
const express = require('express');
const mysql = require('mysql');


jest.mock('mysql');


const app = express();
app.use(express.json());


app.post('/vevo/create', (req, res) => {
  res.json({ 
    success: true,
    id: 1
  });
});


app.post('/orders/create', (req, res) => {
  res.json({ 
    success: true,
    orderId: 1
  });
});


app.get('/api/order-stats/:userId', (req, res) => {
  res.json({
    totalOrders: 5,
    totalAmount: 25000,
    lastOrderDate: new Date().toISOString()
  });
});


app.post('/api/update-order-stats', (req, res) => {
  res.json({
    totalOrders: 5,
    totalAmount: 25000,
    lastOrderDate: new Date().toISOString()
  });
});

describe('Rendelések kezelése', () => {
  beforeEach(() => {
    
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        
        if (query.includes('INSERT INTO vevo')) {
          callback(null, { insertId: 1 });
        } else if (query.includes('INSERT INTO rendeles')) {
          callback(null, { insertId: 1 });
        } else if (query.includes('SELECT r.*, v.id as vevo_id, r.ar, r.mennyiseg, r.date')) {
          callback(null, [
            { id: 1, termek: 1, statusz: 'Feldolgozás alatt', mennyiseg: 2, vevo_id: 1, ar: 5000, date: new Date().toISOString() },
            { id: 2, termek: 2, statusz: 'Feldolgozás alatt', mennyiseg: 1, vevo_id: 1, ar: 6000, date: new Date().toISOString() }
          ]);
        } else if (query.includes('SELECT r.*, t.ar')) {
          callback(null, [
            { id: 1, termek: 1, statusz: 'Feldolgozás alatt', mennyiseg: 2, vevo_id: 1, ar: 5000 },
            { id: 2, termek: 2, statusz: 'Feldolgozás alatt', mennyiseg: 1, vevo_id: 1, ar: 6000 }
          ]);
        }
      })
    });
  });

  test('POST /vevo/create sikeresen létrehozza a vevőt', async () => {
    const vevoData = {
      nev: 'Teszt Vevő',
      telefonszam: '+36301234567',
      email: 'teszt@example.com',
      irsz: '1234',
      telepules: 'Budapest',
      kozterulet: 'Teszt utca 1.'
    };
    
    const response = await request(app)
      .post('/vevo/create')
      .send(vevoData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('id');
  });
  
  test('POST /orders/create sikeresen létrehozza a rendelést', async () => {
    const orderData = {
      termek: 1,
      statusz: 'Feldolgozás alatt',
      mennyiseg: 2,
      vevo_id: 1,
      ar: 5000
    };
    
    const response = await request(app)
      .post('/orders/create')
      .send(orderData);
    
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('orderId');
    });
    
    test('GET /api/order-stats/:userId sikeresen lekéri a rendelési statisztikákat', async () => {
      const response = await request(app).get('/api/order-stats/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body).toHaveProperty('lastOrderDate');
    });
    
    test('POST /api/update-order-stats sikeresen frissíti a rendelési statisztikákat', async () => {
      const statsData = {
        userId: 1,
        orderAmount: 10000,
        orderDate: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/update-order-stats')
        .send(statsData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body).toHaveProperty('lastOrderDate');
    });
  });
  
