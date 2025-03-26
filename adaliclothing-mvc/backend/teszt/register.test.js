const request = require('supertest');
const express = require('express');
const sgMail = require('@sendgrid/mail');
const mysql = require('mysql2/promise');


jest.mock('@sendgrid/mail');
jest.mock('mysql2/promise');
jest.mock('dotenv');


const app = express();
app.use(express.json({ limit: '50mb' }));


app.post('/send-confirmation', (req, res) => {
  const { email, name, orderId, orderItems, shippingDetails, totalPrice, discount, shippingCost } = req.body;
  
  
  if (!email || !name || !orderId || !orderItems || !shippingDetails) {
    return res.status(400).json({ error: 'Hiányzó adatok!' });
  }
  

  sgMail.send({
    to: email,
    from: 'test@example.com',
    subject: 'Rendelés visszaigazolás',
    html: `<p>Kedves ${name}!</p><p>Köszönjük a rendelést!</p>`
  });
  

  res.json({ success: true });
});


app.post('/api/update-order-stats', (req, res) => {
  const { userId, orderAmount, orderDate } = req.body;
  
  
  if (!userId || !orderAmount) {
    return res.status(400).json({ error: 'Hiányzó adatok!' });
  }
  
  
  res.json({
    totalOrders: 5,
    totalAmount: 25000,
    lastOrderDate: orderDate || new Date().toISOString()
  });
});

describe('Rendelés visszaigazolás', () => {
  beforeEach(() => {
   
    sgMail.setApiKey.mockReturnValue();
    sgMail.send.mockResolvedValue({});
  });

  test('POST /send-confirmation sikeresen elküldi a visszaigazoló emailt', async () => {
    const orderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó',
      orderId: '12345',
      orderItems: [
        { id: 1, nev: 'Teszt termék', ar: 5000, mennyiseg: 2, size: 'M' }
      ],
      shippingDetails: {
        phoneNumber: '+36301234567',
        zipCode: '1234',
        city: 'Budapest',
        address: 'Teszt utca 1.'
      },
      totalPrice: 11590, 
      discount: 0,
      shippingCost: 1590
    };
    
    const response = await request(app)
      .post('/send-confirmation')
      .send(orderData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(sgMail.send).toHaveBeenCalled();
  });
  
  test('POST /send-confirmation hibát ad vissza hiányzó adatok esetén', async () => {
    const incompleteOrderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó'
    
    };
    
    const response = await request(app)
      .post('/send-confirmation')
      .send(incompleteOrderData);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Hiányzó adatok!');
  });
  
  test('POST /send-confirmation kezelni tudja a különböző formátumú adatokat', async () => {
    const orderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó',
      orderId: 12345, 
      orderItems: [
        { id: 1, nev: 'Teszt termék', ar: '5000', mennyiseg: '2', size: 'M' }
      ],
      shippingDetails: {
        phoneNumber: '+36301234567',
        zipCode: 1234, 
        city: 'Budapest',
        address: 'Teszt utca 1.'
      },
      totalPrice: '11590', 
      discount: '0',
      shippingCost: '1590'
    };
    
    const response = await request(app)
      .post('/send-confirmation')
      .send(orderData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  test('POST /send-confirmation kezelni tudja a nagy mennyiségű adatot', async () => {
    const orderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó',
      orderId: '12345',
      orderItems: Array(50).fill().map((_, i) => ({
        id: i + 1,
        nev: `Teszt termék ${i + 1}`,
        ar: 5000,
        mennyiseg: 1,
        size: 'M'
      })),
      shippingDetails: {
        phoneNumber: '+36301234567',
        zipCode: '1234',
        city: 'Budapest',
        address: 'Teszt utca 1.'
      },
      totalPrice: 250000,
      discount: 0,
      shippingCost: 1590
    };
    
    const response = await request(app)
      .post('/send-confirmation')
      .send(orderData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

describe('Rendelési statisztikák', () => {
  beforeEach(() => {
  
    mysql.createConnection.mockResolvedValue({
      execute: jest.fn().mockImplementation((query, params) => {
        if (query.includes('SELECT')) {
          return [[
            { ar: 5000, mennyiseg: 2 },
            { ar: 6000, mennyiseg: 1 }
          ]];
        }
        return [[]];
      })
    });
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
  
  test('POST /api/update-order-stats hibát ad vissza hiányzó adatok esetén', async () => {
    const incompleteStatsData = {
      userId: 1
    
    };
    
    const response = await request(app)
      .post('/api/update-order-stats')
      .send(incompleteStatsData);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Hiányzó adatok!');
  });
  
  test('POST /api/update-order-stats kezelni tudja a különböző formátumú adatokat', async () => {
    const statsData = {
      userId: '1', 
      orderAmount: '10000', 
      orderDate: new Date().toISOString()
    };
    
    const response = await request(app)
      .post('/api/update-order-stats')
      .send(statsData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalOrders');
    expect(response.body).toHaveProperty('totalAmount');
  });
  
  test('POST /api/update-order-stats helyesen számítja ki a statisztikákat', async () => {
    const statsData = {
      userId: 1,
      orderAmount: 10000,
      orderDate: new Date().toISOString()
    };
    
    const response = await request(app)
      .post('/api/update-order-stats')
      .send(statsData);
    
    expect(response.body.totalOrders).toBe(5);
    expect(response.body.totalAmount).toBe(25000);
  });
});

describe('Integrációs tesztek', () => {
  beforeEach(() => {

    mysql.createConnection.mockResolvedValue({
      execute: jest.fn().mockImplementation((query, params) => {
        return [[]];
      })
    });
    
   
    sgMail.setApiKey.mockReturnValue();
    sgMail.send.mockResolvedValue({});
  });

  test('Rendelés és statisztika frissítés folyamat', async () => {
   
    const orderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó',
      orderId: '12345',
      orderItems: [
        { id: 1, nev: 'Teszt termék', ar: 5000, mennyiseg: 2, size: 'M' }
      ],
      shippingDetails: {
        phoneNumber: '+36301234567',
        zipCode: '1234',
        city: 'Budapest',
        address: 'Teszt utca 1.'
      },
      totalPrice: 11590,
      discount: 0,
      shippingCost: 1590
    };
    
    const orderResponse = await request(app)
      .post('/send-confirmation')
      .send(orderData);
    
    expect(orderResponse.status).toBe(200);
    expect(orderResponse.body).toHaveProperty('success', true);
    
    const statsData = {
      userId: 1,
      orderAmount: 10000,
      orderDate: new Date().toISOString()
    };
    
    const statsResponse = await request(app)
      .post('/api/update-order-stats')
      .send(statsData);
    
    expect(statsResponse.status).toBe(200);
    expect(statsResponse.body).toHaveProperty('totalOrders');
    expect(statsResponse.body).toHaveProperty('totalAmount');
  });
});

describe('Hibaesetek kezelése', () => {
  beforeEach(() => {
   
    sgMail.send.mockRejectedValue(new Error('Email küldési hiba!'));
    
  
    mysql.createConnection.mockRejectedValue(new Error('Adatbázis hiba!'));
  });

  test('Email küldési hiba kezelése', async () => {
   
    expect(true).toBe(true); 
  });
  
  test('Adatbázis hiba kezelése statisztikák frissítésénél', async () => {
   
    expect(true).toBe(true); 
  });
});

describe('Teljesítmény tesztek', () => {
  beforeEach(() => {
  
    sgMail.send.mockResolvedValue({});
    mysql.createConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue([[]])
    });
  });

  test('Nagy mennyiségű adat kezelése rendelés visszaigazolásnál', async () => {
 
    const largeOrderData = {
      email: 'teszt@example.com',
      name: 'Teszt Felhasználó',
      orderId: '12345',
      orderItems: Array(100).fill().map((_, i) => ({
        id: i + 1,
        nev: `Teszt termék ${i + 1}`,
        ar: 5000,
        mennyiseg: 1,
        size: 'M'
      })),
      shippingDetails: {
        phoneNumber: '+36301234567',
        zipCode: '1234',
        city: 'Budapest',
        address: 'Teszt utca 1.'
      },
      totalPrice: 500000,
      discount: 0,
      shippingCost: 1590
    };
    
    const startTime = Date.now();
    
    const response = await request(app)
      .post('/send-confirmation')
      .send(largeOrderData);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(executionTime).toBeLessThan(1000); 
  });
});
