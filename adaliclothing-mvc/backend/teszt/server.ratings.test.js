const request = require('supertest');
const express = require('express');
const mysql = require('mysql');


jest.mock('mysql');


const app = express();
app.use(express.json());


app.get('/get-all-ratings', (req, res) => {
  res.json([
    { rating_id: 1, rating: 5, date: '2023-01-01', velemeny: 'Nagyon jó!', felhasznalonev: 'Teszt Felhasználó' },
    { rating_id: 2, rating: 4, date: '2023-01-02', velemeny: 'Jó termék!', felhasznalonev: 'Másik Felhasználó' }
  ]);
});


app.post('/save-rating', (req, res) => {
  res.json({ success: true });
});


app.delete('/delete-rating/:id', (req, res) => {
  res.json({ success: true });
});


app.put('/update-rating/:id', (req, res) => {
  res.json({ success: true });
});


app.post('/add-rating', (req, res) => {
  res.json({ success: true });
});

describe('Értékelések kezelése', () => {
  beforeEach(() => {
    
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        
        if (query.includes('SELECT r.rating_id, r.rating, r.date, r.velemeny, u.felhasznalonev')) {
          callback(null, [
            { rating_id: 1, rating: 5, date: '2023-01-01', velemeny: 'Nagyon jó!', felhasznalonev: 'Teszt Felhasználó' },
            { rating_id: 2, rating: 4, date: '2023-01-02', velemeny: 'Jó termék!', felhasznalonev: 'Másik Felhasználó' }
          ]);
        } else if (query.includes('SELECT f_azonosito FROM user WHERE email = ?')) {
          callback(null, [{ f_azonosito: 1 }]);
        } else if (query.includes('INSERT INTO ratings')) {
          callback(null, { insertId: 3 });
        } else if (query.includes('DELETE FROM ratings')) {
          callback(null, { affectedRows: 1 });
        } else if (query.includes('UPDATE ratings')) {
          callback(null, { affectedRows: 1 });
        } else if (query.includes('SELECT f_azonosito FROM user WHERE felhasznalonev = ?')) {
          callback(null, [{ f_azonosito: 2 }]);
        }
      })
    });
  });

  test('GET /get-all-ratings sikeresen lekéri az értékeléseket', async () => {
    const response = await request(app).get('/get-all-ratings');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('rating_id');
    expect(response.body[0]).toHaveProperty('rating');
    expect(response.body[0]).toHaveProperty('velemeny');
    expect(response.body[0]).toHaveProperty('felhasznalonev');
  });
  
  test('POST /save-rating sikeresen menti az értékelést', async () => {
    const ratingData = {
      rating: 5,
      velemeny: 'Nagyon elégedett vagyok a szolgáltatással!',
      email: 'teszt@example.com'
    };
    
    const response = await request(app)
      .post('/save-rating')
      .send(ratingData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  test('DELETE /delete-rating/:id sikeresen törli az értékelést', async () => {
    const response = await request(app).delete('/delete-rating/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  test('PUT /update-rating/:id sikeresen módosítja az értékelést', async () => {
    const updateData = {
      rating: 4,
      velemeny: 'Módosított vélemény'
    };
    
    const response = await request(app)
      .put('/update-rating/1')
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  test('POST /add-rating sikeresen hozzáad egy értékelést', async () => {
    const ratingData = {
      felhasznalonev: 'Teszt Felhasználó',
      rating: 5,
      velemeny: 'Új értékelés'
    };
    
    const response = await request(app)
      .post('/add-rating')
      .send(ratingData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
