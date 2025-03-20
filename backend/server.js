import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import vision from '@google-cloud/vision';
import path from 'path';




const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'webshoppp',
  password: 'Premo900',
  database: 'webshoppp'
});

db.connect((err) => {
  if (err) {
    console.log('Hiba az adatbázis kapcsolódásnál:', err);
    return;
  }
  console.log('MySQL adatbázis kapcsolódva');
});



app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM kategoriak';
  db.query(query, (err, results) => {
    if (err) {
      console.log('Hiba a kategóriák lekérésénél:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    res.json(results);
  });
});

app.get('/products', (req, res) => {
  const query = 'SELECT * FROM usertermekek';
  db.query(query, (err, results) => {
    console.log('Lekért adatok:', results); // Ellenőrzéshez
    res.json(results);
  });
});

app.get('/termekekk', (req, res) => {
  const query = 'SELECT * FROM termekek';
  db.query(query, (err, results) => {
    console.log('Lekért adatok:', results); // Ellenőrzéshez
    res.json(results);
  });
});



app.post('/usertermekek', (req, res) => {
  const { kategoriaId, ar, nev, leiras, meret, imageUrl, images } = req.body;
  
  const query = `
    INSERT INTO usertermekek 
    (kategoriaId, ar, nev, leiras, meret, imageUrl, images) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [kategoriaId, ar, nev, leiras, meret, imageUrl, JSON.stringify(images)], (err, result) => {
    if (err) {
      console.log('SQL error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, id: result.insertId });
  });
});
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = 'DELETE FROM usertermekek WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.log('Hiba a termék törlésénél:', err);
      res.status(500).json({ error: 'Hiba a törlés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen törölve' });
  });
});

app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { ar, nev, leiras, meret } = req.body;
  
  const query = 'UPDATE usertermekek SET ar = ?, nev = ?, leiras = ?, meret = ? WHERE id = ?';
  
  db.query(query, [ar, nev, leiras, meret, productId], (err, result) => {
    if (err) {
      console.log('Hiba a termék frissítésénél:', err);
      res.status(500).json({ error: 'Hiba a frissítés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen frissítve' });
  });
});

app.get('/products/:id', (req, res) => {
  console.log('Requested product ID:', req.params.id);
  const query = 'SELECT * FROM usertermekek WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    console.log('Query results:', results);
    if (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(results[0]);
  });
});


app.post('/vevo/create', (req, res) => {
  const { nev, telefonszam, email, irsz, telepules, kozterulet } = req.body;
  
  const query = `
    INSERT INTO vevo 
    (nev, telefonszam, email, irsz, telepules, kozterulet) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [nev, telefonszam, email, irsz, telepules, kozterulet], (err, result) => {
    if (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true,
      id: result.insertId 
    });
  });
});

app.post('/orders/create', (req, res) => {
  const { termek, statusz, mennyiseg, vevo_id, ar } = req.body;
  
  const query = `
    INSERT INTO rendeles 
    (termek, statusz, mennyiseg, vevo_id, ar) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(query, [termek, statusz, mennyiseg, vevo_id, ar], (err, result) => {
    if (err) {
      console.log('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true,
      orderId: result.insertId
    });
  });
});
app.get('/termekek/:id', (req, res) => {
  console.log('Kért termék ID:', req.params.id); 
  const query = 'SELECT * FROM termekek WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.log('Adatbázis hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    console.log('Találat:', results); 
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Termék nem található' });
    }
    return res.json(results[0]);
  });
});

app.post('/termekek/create', (req, res) => {
  const { nev, ar, termekleiras, kategoria, imageUrl, kategoriaId } = req.body;
  
  const query = `
    INSERT INTO termekek 
    (nev, ar, termekleiras, kategoria, imageUrl, kategoriaId) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [nev, ar, termekleiras, kategoria, imageUrl, kategoriaId], (err, result) => {
    if (err) {
      console.log('SQL error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      success: true,
      id: result.insertId,
      message: 'Termék sikeresen létrehozva' 
    });
  });
});



app.get('/termekek', (req, res) => {
  const query = 'SELECT * FROM termekek';
  db.query(query, (err, results) => {
    if (err) {
      console.log('Hiba a termékek lekérésénél:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    console.log('Lekért termékek:', results);
    res.json(results);
  });
});

app.put('/termekek/:id', (req, res) => {
  const { id } = req.params;
  const { ar, termekleiras } = req.body;
  
  const query = 'UPDATE termekek SET ar = ?, termekleiras = ? WHERE id = ?';
  
  db.query(query, [ar, termekleiras, id], (err, result) => {
    if (err) {
      console.log('Hiba a termék frissítésénél:', err);
      res.status(500).json({ error: 'Hiba a frissítés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen frissítve' });
  });
});

app.delete('/termekek/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = 'DELETE FROM termekek WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.log('Hiba a termék törlésénél:', err);
      res.status(500).json({ error: 'Hiba a törlés során' });
      return;
    }
    res.json({ message: 'Termék sikeresen törölve' });
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT * FROM user';
  db.query(query, (err, results) => {
    if (err) {
      console.log('Hiba a felhasználók lekérésénél:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    res.json(results);
  });
});


app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Először töröljük a kapcsolódó értékeléseket
  const deleteRatingsQuery = 'DELETE FROM ratings WHERE f_azonosito = ?';
  db.query(deleteRatingsQuery, [userId], (ratingErr, ratingResult) => {
    if (ratingErr) {
      console.log('Hiba az értékelések törlésénél:', ratingErr);
      res.status(500).json({ error: 'Hiba az értékelések törlése során' });
      return;
    }
    
    // Majd töröljük a felhasználót
    const deleteUserQuery = 'DELETE FROM user WHERE f_azonosito = ?';
    db.query(deleteUserQuery, [userId], (userErr, userResult) => {
      if (userErr) {
        console.log('Hiba a felhasználó törlésénél:', userErr);
        res.status(500).json({ error: 'Hiba a felhasználó törlése során' });
        return;
      }
      
      console.log('Felhasználó sikeresen törölve, ID:', userId);
      res.json({ 
        message: 'Felhasználó sikeresen törölve',
        deletedRatings: ratingResult.affectedRows,
        deletedUser: userResult.affectedRows
      });
    });
  });
});

app.post('/save-rating', (req, res) => {
  console.log('Beérkezett adatok:', req.body); 
  
  const { rating, email, velemeny } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  db.query('SELECT f_azonosito FROM user WHERE email = ?', [email], (err, userResult) => {
    if (err) {
      console.log('User lekérés hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }

    const userId = userResult[0].f_azonosito;
    console.log('User ID:', userId); 

    db.query(
      'INSERT INTO ratings (f_azonosito, rating, velemeny, date) VALUES (?, ?, ?, ?)',
      [userId, rating, velemeny, currentDate],
      (err, result) => {
        if (err) {
          console.log('Mentési hiba:', err);
          return res.status(500).json({ error: 'Mentési hiba' });
        }
        res.json({ success: true });
      }
    );
  });
});

app.get('/get-all-ratings', (req, res) => {
  const query = `
    SELECT r.rating_id, r.rating, r.date, r.velemeny, u.felhasznalonev 
    FROM ratings r 
    JOIN user u ON r.f_azonosito = u.f_azonosito 
    ORDER BY r.date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Adatbázis hiba:', err);
      res.status(500).json({ error: 'Adatbázis hiba' });
      return;
    }
    res.json(results);
  });
});


app.delete('/delete-rating/:id', (req, res) => {
  const ratingId = req.params.id;
  
  db.query('DELETE FROM ratings WHERE rating_id = ?', [ratingId], (err, result) => {
    if (err) {
      console.error('Törlési hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    res.json({ success: true });
  });
});

app.put('/update-rating/:id', (req, res) => {
  const { rating, velemeny } = req.body;
  const ratingId = req.params.id;
  
  const query = 'UPDATE ratings SET rating = ?, velemeny = ? WHERE rating_id = ?';
  db.query(query, [rating, velemeny, ratingId], (err, result) => {
    if (err) {
      console.log('Update error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

app.post('/add-rating', (req, res) => {
  const { felhasznalonev, rating, velemeny } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

 
  db.query('SELECT f_azonosito FROM user WHERE felhasznalonev = ?', [felhasznalonev], (err, users) => {
    if (err) {
      console.log('User query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    const userId = users[0].f_azonosito;
    db.query(
      'INSERT INTO ratings (f_azonosito, rating, velemeny, date) VALUES (?, ?, ?, ?)',
      [userId, rating, velemeny, currentDate],
      (err, result) => {
        if (err) {
          console.log('Insert error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
      }
    );
  });
});

app.get('/check-user/:username', (req, res) => {
  const username = req.params.username;
  db.query('SELECT email FROM user WHERE felhasznalonev = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      res.json({ exists: false });
    } else {
      res.json({ exists: true, email: results[0].email });
    }
  });
});








const storage = multer.diskStorage({
  destination: './kep',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.originalname.split('.')[0] + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB limit
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    filename: req.file.filename
  });
});





app.use('/kep', (req, res, next) => {
  console.log('Image requested:', req.url);
  next();
});




app.get('/api/order-stats/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const query = `
    SELECT r.*, v.id as vevo_id, r.ar, r.mennyiseg, r.date
    FROM rendeles r
    JOIN vevo v ON r.vevo_id = v.id
    WHERE r.vevo_id IN (
      SELECT id FROM vevo WHERE email = (
        SELECT email FROM user WHERE f_azonosito = ?
      )
    )
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log('Query results:', results);
      return res.status(500).json({ error: 'Database error' });
    }

    const stats = {
      totalOrders: results.length,
      totalAmount: results.reduce((sum, order) => sum + (Number(order.ar) * order.mennyiseg), 0),
      lastOrderDate: results.length > 0 ? results[results.length - 1].date : null
    };

    console.log('Stats calculated:', stats);
    res.json(stats);
  });
});




app.post('/api/update-order-stats', (req, res) => {
  const { userId, orderAmount, orderDate } = req.body;
  
  const query = `
    SELECT r.*, t.ar 
    FROM rendeles r
    LEFT JOIN termekek t ON r.termek = t.id
    WHERE r.vevo_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log('Adatbázis hiba:', err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }

    const stats = {
      totalOrders: results.length + 1,
      totalAmount: results.reduce((sum, order) => sum + (order.ar * order.mennyiseg), 0) + orderAmount,
      lastOrderDate: orderDate
    };

    res.json(stats);
  });
});



// Explicit módon adjuk meg a kulcsfájl elérési útját
const keyFilePath = path.resolve('./vision-api-key.json');
console.log('Vision API kulcs elérési útja:', keyFilePath);

// Inicializáljuk a Vision API klienst
let visionClient;
try {
  visionClient = new ImageAnnotatorClient({
    keyFilename: keyFilePath
  });
  console.log('Vision API kliens sikeresen inicializálva');
} catch (error) {
  console.error('Hiba a Vision API kliens inicializálásakor:', error);
}

// API használat nyomon követése
async function checkApiUsage(apiName) {
  try {
    const [rows] = await db.query('SELECT * FROM api_usage WHERE api_name = ?', [apiName]);
    return rows[0] || { usage_count: 0, limit_count: 1000 };
  } catch (error) {
    console.error('Hiba az API használat ellenőrzésekor:', error);
    return { usage_count: 0, limit_count: 1000 };
  }
}






// Implementáljuk a /api/analyze-image végpontot a Vision API használatával
app.post('/api/analyze-image', async (req, res) => {
  try {
    console.log('Kép elemzése kezdődik...');
    
    // Ellenőrizzük, hogy a kép megfelelő formátumú-e
    if (!req.body.image || !req.body.image.startsWith('data:image/')) {
      return res.status(400).json({
        error: 'Érvénytelen képformátum',
        fallback: getFallbackResponse()
      });
    }
    
    // Kép adatok kinyerése a base64 stringből
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    try {
      // Növeljük az API használati számlálót
      await incrementApiUsage('vision_api');
      
      // Vision API kliens inicializálása
      const visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './vision-api-key.json'
      });
      
      // Vision API hívások
      const [labelResult] = await visionClient.labelDetection(buffer);
      const [objectResult] = await visionClient.objectLocalization(buffer);
      const [imagePropertiesResult] = await visionClient.imageProperties(buffer);
      
      // Eredmények feldolgozása
      const labels = labelResult.labelAnnotations || [];
      const objects = objectResult.localizedObjectAnnotations || [];
      const colors = imagePropertiesResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
      
      const clothingCategories = [
        { id: '1', name: 'Sapkák', keywords: ['sapka', 'kalap', 'fejfedő', 'hat', 'cap', 'beanie'] },
        { id: '2', name: 'Nadrágok', keywords: ['nadrág', 'farmer', 'pants', 'jeans', 'trousers', 'shorts', 'rövidnadrág'] },
        { id: '3', name: 'Zoknik', keywords: ['zokni', 'sock', 'socks', 'harisnya'] },
        { id: '4', name: 'Pólók', keywords: ['póló', 't-shirt', 'shirt', 'tshirt', 'top'] },
        { id: '5', name: 'Pulloverek', keywords: ['pulóver', 'pulcsi', 'sweater', 'sweatshirt', 'hoodie', 'kapucnis'] },
        { id: '6', name: 'Kabátok', keywords: ['kabát', 'dzseki', 'coat', 'jacket', 'blazer', 'overcoat'] },
        { id: '7', name: 'Lábviseletek', keywords: ['cipő', 'bakancs', 'csizma', 'szandál', 'shoe', 'boot', 'footwear', 'sneaker', 'sandal'] },
        { id: '8', name: 'Atléták', keywords: ['atléta', 'trikó', 'tank top', 'sleeveless'] },
        { id: '9', name: 'Kiegészítők', keywords: ['kiegészítő', 'accessory', 'öv', 'belt', 'nyaklánc', 'necklace', 'karkötő', 'bracelet'] },
        { id: '10', name: 'Szoknyák', keywords: ['szoknya', 'skirt'] },
        { id: '11', name: 'Alsóneműk', keywords: ['alsónemű', 'underwear', 'boxer', 'bugyi', 'melltartó', 'bra'] },
        { id: '12', name: 'Mellények', keywords: ['mellény', 'vest', 'waistcoat'] }
      ];
      
      // Minden ruházati kulcsszó összegyűjtése egy tömbbe
      const allClothingKeywords = clothingCategories.flatMap(category => category.keywords);
      
      // Ellenőrizzük, hogy van-e ruházati termék a képen
      const hasClothingItem = labels.some(label => 
        allClothingKeywords.some(keyword => 
          label.description.toLowerCase().includes(keyword)
        )
      ) || objects.some(object => 
        allClothingKeywords.some(keyword => 
          object.name.toLowerCase().includes(keyword)
        )
      );
      
      // Ha nincs ruházati termék, küldjünk vissza hibaüzenetet
      if (!hasClothingItem) {
        return res.status(400).json({
          error: 'Nem sikerült ruházati terméket felismerni a képen. Kérjük, töltsön fel egy másik képet, amelyen jól látható a ruhadarab.',
          isImageError: true,
          fallback: getFallbackResponse()
        });
      }
      
      // Kategória meghatározása a felismert címkék alapján
      let suggestedCategory = '4'; // Alapértelmezett: Pólók
      let highestMatchScore = 0;
      
      // Minden címke és objektum vizsgálata
      const allDetections = [
        ...labels.map(label => ({ text: label.description.toLowerCase(), score: label.score })),
        ...objects.map(obj => ({ text: obj.name.toLowerCase(), score: obj.score }))
      ];
      
      // Kategóriák ellenőrzése
      for (const category of clothingCategories) {
        for (const detection of allDetections) {
          for (const keyword of category.keywords) {
            if (detection.text.includes(keyword)) {
              // Ha a pontszám magasabb, mint az eddigi legjobb, frissítjük a javasolt kategóriát
              if (detection.score > highestMatchScore) {
                highestMatchScore = detection.score;
                suggestedCategory = category.id;
                console.log(`Kategória találat: ${category.name} (${category.id}), kulcsszó: ${keyword}, pontszám: ${detection.score}`);
              }
            }
          }
        }
      }
      
      // Leírás generálása a felismert kategória alapján
      let suggestedDescription = 'Kiváló minőségű ruhadarab. A termék kényelmes anyagból készült.';
      
      // Kategória-specifikus leírások
      const categoryDescriptions = {
        '1': 'Stílusos sapka, amely tökéletesen kiegészíti öltözékedet. Kényelmes viselet minden évszakban.',
        '2': 'Kényelmes szabású nadrág, amely tökéletes választás a mindennapokra. Tartós anyagból készült.',
        '3': 'Puha, kényelmes zokni, amely egész nap kellemes viseletet biztosít. Tartós anyagból készült.',
        '4': 'Divatos póló, amely tökéletesen illeszkedik a testhez. Puha, kellemes tapintású anyagból készült.',
        '5': 'Meleg, kényelmes pulóver, amely tökéletes választás a hűvösebb napokra. Puha anyagból készült.',
        '6': 'Stílusos kabát, amely melegen tart a hideg időben. Tartós, minőségi anyagból készült.',
        '7': 'Kényelmes lábbeli, amely egész nap kellemes viseletet biztosít. Strapabíró talppal rendelkezik.',
        '8': 'Könnyű, szellős atléta, amely tökéletes választás a meleg napokra vagy sportoláshoz.',
        '9': 'Divatos kiegészítő, amely tökéletesen kiegészíti öltözékedet és kiemeli stílusodat.',
        '10': 'Divatos szoknya, amely kényelmes viseletet biztosít. Sokoldalúan kombinálható darab.',
        '11': 'Kényelmes alsónemű, amely egész nap kellemes viseletet biztosít. Puha, bőrbarát anyagból készült.',
        '12': 'Stílusos mellény, amely tökéletesen kiegészíti öltözékedet. Sokoldalúan kombinálható darab.'
      };
      
      // Ha van specifikus leírás a kategóriához, használjuk azt
      if (categoryDescriptions[suggestedCategory]) {
        suggestedDescription = categoryDescriptions[suggestedCategory];
      }
      
      // Válasz összeállítása
      const response = {
        suggestedCategory,
        suggestedDescription,
        quality: 0.8,
        tags: labels.slice(0, 5).map(label => label.description),
        colors: colors.slice(0, 3).map(color => {
          const rgb = color.color;
          return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
        }),
        confidence: highestMatchScore || (labels.length > 0 ? labels[0].score : 0.7)
      };
      
      console.log('Válasz előkészítve:', response);
      res.json(response);
    } catch (apiError) {
      console.error('Hiba a Vision API használata során:', apiError);
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getFallbackResponse()
      });
    }
  } catch (error) {
    console.error('Hiba a kép elemzése során:', error);
    res.status(500).json({
      error: 'Hiba a kép elemzése során: ' + error.message,
      fallback: getFallbackResponse()
    });
  }
});

// Fallback válasz függvény
function getFallbackResponse() {
  return {
    suggestedCategory: '4',
    suggestedDescription: 'Kiváló minőségű ruhadarab. A termék kényelmes anyagból készült.',
    quality: 0.8,
    tags: ['ruha', 'divat'],
    colors: ['fekete', 'fehér', 'szürke'],
    confidence: 0.7
  };
}


// API használat növelése
async function incrementApiUsage(apiName) {
try {
  const query = `
    INSERT INTO api_usage (api_name, usage_count, reset_date, last_updated)
    VALUES (?, 1, DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), NOW())
    ON DUPLICATE KEY UPDATE 
      usage_count = usage_count + 1,
      last_updated = NOW()
  `;
  
  await db.query(query, [apiName]);
  console.log(`${apiName} használati számláló növelve`);
} catch (error) {
  console.error('Hiba az API használat növelésekor:', error);
}
}

// Segédfüggvény a színek összehasonlításához
function isColorClose(color1, color2, threshold) {
  const distance = Math.sqrt(
    Math.pow(color1.red - color2.red, 2) +
    Math.pow(color1.green - color2.green, 2) +
    Math.pow(color1.blue - color2.blue, 2)
  );
  return distance;
}

// API használat lekérdezése
app.get('/api/usage', (req, res) => {
  try {
    console.log('API usage request received');
    
    // Ellenőrizzük, hogy az adatbázis kapcsolat él-e
    if (!db || db.state === 'disconnected') {
      console.error('Adatbázis kapcsolat nem elérhető');
      return res.status(500).json({ error: 'Adatbázis kapcsolat nem elérhető' });
    }
    
    const query = 'SELECT * FROM api_usage';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Hiba az API használat lekérdezésekor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('API usage data retrieved:', results);
      res.json(results || []);
    });
  } catch (error) {
    console.error('Váratlan hiba az API használat lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

// API használat nullázása
app.post('/api/usage/reset', async (req, res) => {
  try {
    const { apiName } = req.body;
    await db.query(
      'UPDATE api_usage SET usage_count = 0, reset_date = DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), last_updated = NOW() WHERE api_name = ?',
      [apiName]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Hiba az API használat nullázásakor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});





const port = 5000;
app.listen(port, () => {
  console.log(`Server fut a ${port} porton`);
});

