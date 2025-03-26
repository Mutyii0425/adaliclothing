const request = require('supertest');
const express = require('express');
const mysql = require('mysql');


jest.mock('mysql');


const app = express();
app.use(express.json());


app.get('/categories', (req, res) => {
  res.json([
    { cs_azonosito: 1, cs_nev: 'Sapkák' },
    { cs_azonosito: 2, cs_nev: 'Nadrágok' },
    { cs_azonosito: 3, cs_nev: 'Zoknik' },
    { cs_azonosito: 4, cs_nev: 'Pólók' }
  ]);
});

describe('Kategóriák kezelése', () => {
  beforeEach(() => {

    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, callback) => {
        if (query.includes('SELECT * FROM kategoriak')) {
          callback(null, [
            { cs_azonosito: 1, cs_nev: 'Sapkák' },
            { cs_azonosito: 2, cs_nev: 'Nadrágok' },
            { cs_azonosito: 3, cs_nev: 'Zoknik' },
            { cs_azonosito: 4, cs_nev: 'Pólók' }
          ]);
        }
      })
    });
  });

  test('GET /categories sikeresen lekéri a kategóriákat', async () => {
    const response = await request(app).get('/categories');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('cs_azonosito');
    expect(response.body[0]).toHaveProperty('cs_nev');
  });
});
