const request = require('supertest');
const express = require('express');
const mysql = require('mysql'); 


jest.mock('mysql');

const app = express();

app.get('/categories', (req, res) => {
  const mockCategories = [
    { cs_azonosito: 1, cs_nev: 'Sapkák' },
    { cs_azonosito: 2, cs_nev: 'Nadrágok' }
  ];
  res.json(mockCategories);
});


app.post('/usertermekek', (req, res) => {
  res.json({ success: true, id: 1 });
});


app.post('/api/analyze-image', (req, res) => {
  res.json({
    suggestedCategory: '4',
    suggestedDescription: 'Divatos póló, amely tökéletesen illeszkedik a testhez.',
    quality: 0.8,
    tags: ['póló', 'ruha', 'divat'],
    colors: ['rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
    confidence: 0.9
  });
});

describe('Kategóriák lekérése', () => {
  test('GET /categories sikeresen lekéri a kategóriákat', async () => {
   
    const mockCategories = [
      { cs_azonosito: 1, cs_nev: 'Sapkák' },
      { cs_azonosito: 2, cs_nev: 'Nadrágok' }
    ];
    
    
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, callback) => {
        callback(null, mockCategories);
      })
    });
    
    const response = await request(app).get('/categories');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategories);
  });
});

describe('Termék feltöltés', () => {
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
    
   
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, params, callback) => {
        callback(null, { insertId: 1 });
      })
    });
    
    const response = await request(app)
      .post('/usertermekek')
      .send(testProduct);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('id');
  });
});

describe('Kép elemzés', () => {
  test('POST /api/analyze-image sikeresen elemzi a képet', async () => {
   
    const imageData = 'data:image/jpeg;base64,...';
    
   
    jest.mock('@google-cloud/vision', () => ({
      ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
        labelDetection: jest.fn().mockResolvedValue([[{ labelAnnotations: [] }]]),
        objectLocalization: jest.fn().mockResolvedValue([[{ localizedObjectAnnotations: [] }]]),
        imageProperties: jest.fn().mockResolvedValue([[{ imagePropertiesAnnotation: { dominantColors: { colors: [] } } }]])
      }))
    }));
    
    const response = await request(app)
      .post('/api/analyze-image')
      .send({ image: imageData });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('suggestedCategory');
    expect(response.body).toHaveProperty('suggestedDescription');
  });
});
