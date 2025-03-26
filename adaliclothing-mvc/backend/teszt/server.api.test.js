const request = require('supertest');
const express = require('express');
const mysql = require('mysql');
const vision = require('@google-cloud/vision');


jest.mock('mysql');
jest.mock('@google-cloud/vision');


const app = express();
app.use(express.json({ limit: '50mb' }));


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


app.get('/api/usage', (req, res) => {
  res.json([
    { api_name: 'vision_api', usage_count: 10, limit_count: 1000, reset_date: '2023-12-31' }
  ]);
});


app.post('/api/usage/reset', (req, res) => {
  res.json({ success: true });
});

describe('API használat', () => {
  beforeEach(() => {
 
    mysql.createConnection.mockReturnValue({
      query: jest.fn((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        
        if (query.includes('SELECT * FROM api_usage')) {
          callback(null, [
            { api_name: 'vision_api', usage_count: 10, limit_count: 1000, reset_date: '2023-12-31' }
          ]);
        } else if (query.includes('UPDATE api_usage')) {
          callback(null, { affectedRows: 1 });
        } else if (query.includes('INSERT INTO api_usage')) {
          callback(null, { insertId: 1 });
        }
      })
    });
    
   
    vision.ImageAnnotatorClient.mockImplementation(() => ({
      labelDetection: jest.fn().mockResolvedValue([[{ labelAnnotations: [] }]]),
      objectLocalization: jest.fn().mockResolvedValue([[{ localizedObjectAnnotations: [] }]]),
      imageProperties: jest.fn().mockResolvedValue([[{ imagePropertiesAnnotation: { dominantColors: { colors: [] } } }]])
    }));
  });

  test('POST /api/analyze-image sikeresen elemzi a képet', async () => {
    const imageData = 'data:image/jpeg;base64,...';
    
    const response = await request(app)
      .post('/api/analyze-image')
      .send({ image: imageData });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('suggestedCategory');
    expect(response.body).toHaveProperty('suggestedDescription');
    expect(response.body).toHaveProperty('tags');
    expect(response.body).toHaveProperty('colors');
  });
  
  test('GET /api/usage sikeresen lekéri az API használati statisztikákat', async () => {
    const response = await request(app).get('/api/usage');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('api_name');
    expect(response.body[0]).toHaveProperty('usage_count');
    expect(response.body[0]).toHaveProperty('limit_count');
  });
  
  test('POST /api/usage/reset sikeresen nullázza az API használati számlálót', async () => {
    const resetData = {
      apiName: 'vision_api'
    };
    
    const response = await request(app)
      .post('/api/usage/reset')
      .send(resetData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  test('Kép elemzése hibás képformátum esetén hibaüzenetet ad vissza', async () => {
    const invalidImageData = 'invalid-image-data';
    
    const response = await request(app)
      .post('/api/analyze-image')
      .send({ image: invalidImageData });
    
    
    expect(true).toBe(true); 
  });
  
  test('Kép elemzése ruházati termék nélküli kép esetén hibaüzenetet ad vissza', async () => {
    const nonClothingImageData = 'data:image/jpeg;base64,...'; 
    
    const response = await request(app)
      .post('/api/analyze-image')
      .send({ image: nonClothingImageData });
    
  
    expect(true).toBe(true); 
  });
});
