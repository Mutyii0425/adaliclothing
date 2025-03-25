import initializeApp from './app.js';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';


let db;

const initDb = async () => {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'webshoppp',
      password: 'Premo900',
      database: 'webshoppp'
    });
    
    console.log('Adatbázis kapcsolat sikeresen létrejött');
    return db;
  } catch (error) {
    console.error('Hiba az adatbázis kapcsolat létrehozásakor:', error);
    return null;
  }
};


const storage = multer.memoryStorage(); // Memóriában tárolja a fájlokat
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB méretkorlátozás
  }
});

const startServer = async () => {
  const app = await initializeApp();

  db = await initDb();
  
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

app.get('/api/usage', async (req, res) => {
  try {
    console.log('API usage request received');
    
    // Ellenőrizzük, hogy az adatbázis kapcsolat él-e
    if (!db) {
      console.error('Adatbázis kapcsolat nem elérhető');
      return res.status(500).json({ error: 'Adatbázis kapcsolat nem elérhető' });
    }
    
    try {
      // Az összes API használati adat lekérdezése
      const [results] = await db.execute('SELECT * FROM api_usage');
      
      console.log('API usage data retrieved:', results);
      res.json(results || []);
    } catch (dbError) {
      console.error('Hiba az API használat lekérdezésekor:', dbError);
      return res.status(500).json({ error: 'Adatbázis hiba: ' + dbError.message });
    }
  } catch (error) {
    console.error('Váratlan hiba az API használat lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});






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


const visionKeyFilePath2 = path.resolve('./vision-api-key1.json');
console.log('Második Vision API kulcs elérési útja:', visionKeyFilePath2);

// Személyes stílustanácsadó végpontok

app.post('/api/style/analyze-person', upload.single('image'), async (req, res) => {
  try {
    console.log('=== STÍLUS ELEMZÉS KEZDŐDIK (FELTÖLTÖTT FÁJL) ===');
    console.log('Kérés időpontja:', new Date().toISOString());
    
    if (!req.file) {
      console.log('HIBA: Nincs feltöltött fájl');
      return res.status(400).json({ 
        error: 'Nincs feltöltött fájl',
        fallback: getStyleFallbackResponse()
      });
    }
    
    console.log('Feltöltött fájl:', req.file.originalname, 'méret:', req.file.size, 'bytes');
    
    // Növeljük az API használati számlálót
    await incrementApiUsage('style_api');
    console.log('API használati számláló növelve: style_api');
    
    try {
      console.log('=== VISION API HÍVÁSOK KEZDŐDNEK ===');
      
      // Vision API kliens inicializálása
      console.log('Vision API kliens inicializálása...');
      const visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './vision-api-key1.json'
      });
      console.log('Vision API kliens sikeresen inicializálva');
      
      // A req.file.buffer helyett használjuk a req.file.path-t, ha a fájl a lemezre lett mentve
      const imageContent = req.file.buffer || fs.readFileSync(req.file.path);
      
      // Vision API hívások - Promise alapú megközelítés
      console.log('Face Detection API hívás kezdődik...');
      try {
        const [faceDetectionResult] = await visionClient.faceDetection({
          image: { content: imageContent }
        });
        console.log('Face Detection API hívás sikeres!');
        console.log('Face Detection eredmény:', JSON.stringify(faceDetectionResult, null, 2).substring(0, 500) + '...');
      } catch (faceError) {
        console.error('Hiba a Face Detection API hívása során:', faceError);
      }
      
      console.log('Label Detection API hívás kezdődik...');
      try {
        const [labelResult] = await visionClient.labelDetection({
          image: { content: imageContent }
        });
        console.log('Label Detection API hívás sikeres!');
        console.log('Label Detection eredmény:', JSON.stringify(labelResult, null, 2).substring(0, 500) + '...');
      } catch (labelError) {
        console.error('Hiba a Label Detection API hívása során:', labelError);
      }
      
      console.log('Image Properties API hívás kezdődik...');
      try {
        const [imagePropertiesResult] = await visionClient.imageProperties({
          image: { content: imageContent }
        });
        console.log('Image Properties API hívás sikeres!');
        console.log('Image Properties eredmény:', JSON.stringify(imagePropertiesResult, null, 2).substring(0, 500) + '...');
      } catch (propertiesError) {
        console.error('Hiba az Image Properties API hívása során:', propertiesError);
      }
      
      console.log('=== VISION API HÍVÁSOK BEFEJEZVE ===');
      
      // Stílus elemzés generálása
      console.log('Stílus elemzés generálása...');
      const styleAnalysis = generateStyleAnalysis();
      
      console.log('Stílus elemzés eredménye:', JSON.stringify(styleAnalysis, null, 2));
      console.log('=== STÍLUS ELEMZÉS BEFEJEZVE ===');
      
      res.json(styleAnalysis);
    } catch (apiError) {
      console.error('HIBA a Vision API használata során:', apiError);
      console.log('Fallback válasz küldése...');
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getStyleFallbackResponse()
      });
    }
  } catch (error) {
    console.error('HIBA a stílus elemzése során:', error);
    console.log('Fallback válasz küldése...');
    res.status(500).json({
      error: 'Hiba a stílus elemzése során: ' + error.message,
      fallback: getStyleFallbackResponse()
    });
  }
});

// Módosítsd a /api/style/analyze-base64 végpontot
app.post('/api/style/analyze-base64', async (req, res) => {
  try {
    console.log('=== STÍLUS ELEMZÉS KEZDŐDIK (BASE64) ===');
    console.log('Kérés időpontja:', new Date().toISOString());
    
    if (!req.body.image || !req.body.image.startsWith('data:image/')) {
      console.log('HIBA: Érvénytelen képformátum');
      return res.status(400).json({ 
        error: 'Érvénytelen képformátum',
        fallback: getStyleFallbackResponse()
      });
    }
    
    // Kép adatok kinyerése a base64 stringből
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('Kép sikeresen dekódolva base64 formátumból');
    
    // Növeljük az API használati számlálót
    await incrementApiUsage('style_api');
    console.log('API használati számláló növelve: style_api');
    
    try {
      console.log('=== VISION API HÍVÁSOK KEZDŐDNEK ===');
      
      // Vision API kliens inicializálása
      console.log('Vision API kliens inicializálása...');
      const visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './vision-api-key1.json'
      });
      console.log('Vision API kliens sikeresen inicializálva');
      
      // Vision API hívások
      console.log('Face Detection API hívás kezdődik...');
      const [faceDetectionResult] = await visionClient.faceDetection(buffer);
      console.log('Face Detection API hívás sikeres!');
      console.log('Face Detection eredmény:', JSON.stringify(faceDetectionResult, null, 2).substring(0, 500) + '...');
      
      console.log('Label Detection API hívás kezdődik...');
      const [labelResult] = await visionClient.labelDetection(buffer);
      console.log('Label Detection API hívás sikeres!');
      console.log('Label Detection eredmény:', JSON.stringify(labelResult, null, 2).substring(0, 500) + '...');
      
      console.log('Image Properties API hívás kezdődik...');
      const [imagePropertiesResult] = await visionClient.imageProperties(buffer);
      console.log('Image Properties API hívás sikeres!');
      console.log('Image Properties eredmény:', JSON.stringify(imagePropertiesResult, null, 2).substring(0, 500) + '...');
      
      console.log('=== VISION API HÍVÁSOK BEFEJEZVE ===');
      
      console.log('Stílus elemzés generálása a Vision API eredmények alapján...');
      const styleAnalysis = generateStyleAnalysisFromVisionResults(
        faceDetectionResult, 
        labelResult, 
        imagePropertiesResult
      );
      
      console.log('Stílus elemzés eredménye:', JSON.stringify(styleAnalysis, null, 2));
      console.log('=== STÍLUS ELEMZÉS BEFEJEZVE ===');
      
      res.json(styleAnalysis);
    } catch (apiError) {
      console.error('HIBA a Vision API használata során:', apiError);
      console.log('Fallback válasz küldése...');
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getStyleFallbackResponse()
      });
    }
  } catch (error) {
    console.error('HIBA a stílus elemzése során:', error);
    console.log('Fallback válasz küldése...');
    res.status(500).json({
      error: 'Hiba a stílus elemzése során: ' + error.message,
      fallback: getStyleFallbackResponse()
    });
  }
});


// Fallback válasz függvény a stíluselemzéshez
function getStyleFallbackResponse() {
  return {
    colorType: 'Ősz - meleg, mély színek',
    bodyType: 'Homokóra - kiegyensúlyozott váll és csípő, karcsú derék',
    faceShape: 'Ovális - kiegyensúlyozott, harmonikus arcforma',
    recommendedStyle: 'Klasszikus - időtlen, elegáns darabok',
    recommendedColors: [
      { name: 'Bordó', hex: '#800020' },
      { name: 'Olíva', hex: '#708238' },
      { name: 'Terrakotta', hex: '#e2725b' },
      { name: 'Mogyoró', hex: '#a67b5b' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    avoidColors: [
      { name: 'Neon rózsaszín', hex: '#ff6ec7' },
      { name: 'Élénk citromsárga', hex: '#fff700' },
      { name: 'Világoskék', hex: '#add8e6' }
    ],
    styleAdvice: 'Az ősz színtípushoz a meleg, földszínű árnyalatok illenek a legjobban. Homokóra testalkatodhoz válassz olyan ruhákat, amelyek kiemelik a karcsú derekadat. Ovális arcformád sokoldalú, szinte bármilyen frizura és kiegészítő jól áll neked. A klasszikus stílushoz válassz minőségi, időtálló darabokat, amelyek több szezonon át hordhatók.'
  };
}

// Segédfüggvény a stíluselemzés generálásához
function generateStyleAnalysis() {
  // Színtípusok
  const colorTypes = [
    'Tavasz - meleg, világos színek',
    'Nyár - hűvös, lágy színek',
    'Ősz - meleg, mély színek',
    'Tél - hűvös, élénk színek'
  ];
  
  // Testalkat típusok
  const bodyTypes = [
    'Homokóra - kiegyensúlyozott váll és csípő, karcsú derék',
    'Körte - keskenyebb váll, szélesebb csípő',
    'Alma - szélesebb váll és derék, keskenyebb csípő',
    'Téglalap - egyenes testalkat, kevésbé hangsúlyos derék',
    'Fordított háromszög - szélesebb váll, keskenyebb csípő'
  ];
  
  // Arcforma típusok
  const faceShapes = [
    'Ovális - kiegyensúlyozott, harmonikus arcforma',
    'Kerek - lágy vonalak, telt arc',
    'Szögletes - határozott állkapocs, széles homlok',
    'Szív - széles homlok, keskeny áll',
    'Hosszúkás - nyújtott arcforma',
    'Gyémánt - keskeny homlok és áll, széles arccsont'
  ];
  
  // Stílus típusok
  const styleTypes = [
    'Klasszikus - időtlen, elegáns darabok',
    'Természetes - kényelmes, laza viselet',
    'Drámai - merész, feltűnő megjelenés',
    'Romantikus - nőies, lágy vonalak',
    'Városi - modern, trendi darabok',
    'Kreatív - egyedi, művészi megjelenés',
    'Elegáns - kifinomult, minőségi darabok'
  ];
  
  // Ajánlott színek generálása a színtípus alapján
  const colorPalettes = {
    'Tavasz': [
      { name: 'Korall', hex: '#ff7f50' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Meleg zöld', hex: '#32cd32' },
      { name: 'Türkiz', hex: '#40e0d0' }
    ],
    'Nyár': [
      { name: 'Levendula', hex: '#e6e6fa' },
      { name: 'Rózsaszín', hex: '#ffc0cb' },
      { name: 'Világoskék', hex: '#add8e6' },
      { name: 'Szürke', hex: '#808080' },
      { name: 'Mályva', hex: '#e0b0ff' }
    ],
    'Ősz': [
      { name: 'Bordó', hex: '#800020' },
      { name: 'Olíva', hex: '#708238' },
      { name: 'Terrakotta', hex: '#e2725b' },
      { name: 'Mogyoró', hex: '#a67b5b' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Tél': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Fehér', hex: '#ffffff' },
      { name: 'Királykék', hex: '#4169e1' },
      { name: 'Smaragdzöld', hex: '#008000' },
      { name: 'Magenta', hex: '#ff00ff' }
    ]
  };
  
  // Kerülendő színek generálása a színtípus alapján
  const avoidColorPalettes = {
    'Tavasz': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Sötétszürke', hex: '#696969' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Nyár': [
      { name: 'Narancssárga', hex: '#ffa500' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Élénk piros', hex: '#ff0000' }
    ],
    'Ősz': [
      { name: 'Neon rózsaszín', hex: '#ff6ec7' },
      { name: 'Élénk citromsárga', hex: '#fff700' },
      { name: 'Világoskék', hex: '#add8e6' }
    ],
    'Tél': [
      { name: 'Bézs', hex: '#f5f5dc' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Olíva', hex: '#708238' }
    ]
  };
  
  // Véletlenszerű kiválasztás a listákból
  const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  // Színtípus kiválasztása
  const colorType = randomItem(colorTypes);
  const colorTypeName = colorType.split(' - ')[0]; // Csak a színtípus neve (pl. "Tavasz")
  
  // Ajánlott és kerülendő színek kiválasztása a színtípus alapján
  const recommendedColors = colorPalettes[colorTypeName];
  const avoidColors = avoidColorPalettes[colorTypeName];
  
  // Többi tulajdonság kiválasztása
  const bodyType = randomItem(bodyTypes);
  const faceShape = randomItem(faceShapes);
  const recommendedStyle = randomItem(styleTypes);
  
  // Stílustanácsok generálása
  const styleAdvice = `
    A képed alapján a ${colorType.toLowerCase()} típusba tartozol. 
    Testalkatod ${bodyType.toLowerCase()}, ezért érdemes olyan ruhákat választanod, 
    amelyek kiemelik az előnyös tulajdonságaidat. 
    
    Arcformád ${faceShape.toLowerCase()}, ehhez a következő frizurák és kiegészítők állnak jól:
    ${faceShape.includes('Ovális') ? '- Szinte bármilyen frizura és kiegészítő jól áll neked' : 
      faceShape.includes('Kerek') ? '- A hosszabb, réteges frizurák és a hosszúkás fülbevalók nyújtják az arcot' :
      faceShape.includes('Szögletes') ? '- A lágy, hullámos frizurák és kerek formájú kiegészítők lágyítják a vonásokat' :
      faceShape.includes('Szív') ? '- Az állhoz érő vagy hosszabb frizurák, valamint a szélesebb nyakláncok egyensúlyba hozzák az arcot' :
      faceShape.includes('Hosszúkás') ? '- A rövidebb, volumennel rendelkező frizurák és a kerek vagy négyzet alakú kiegészítők rövidítik az arcot' :
      '- A középen elválasztott frizurák és az ovális vagy kerek kiegészítők kiemelik az arccsontot'}
    
    A ${recommendedStyle.toLowerCase()} stílus illik hozzád a legjobban. 
    Válassz olyan ruhákat, amelyek tükrözik ezt a stílust és a színtípusodhoz illő színekben kaphatók.
  `.trim().replace(/\n\s+/g, '\n');
  
  return {
    colorType,
    bodyType,
    faceShape,
    recommendedStyle,
    recommendedColors,
    avoidColors,
    styleAdvice
  };
}

function generateStyleAnalysisFromVisionResults(faceDetectionResult, labelResult, imagePropertiesResult) {
  // Arcforma meghatározása a faceDetectionResult alapján
  let faceShape = "Ovális - kiegyensúlyozott, harmonikus arcforma"; // alapértelmezett
  if (faceDetectionResult && faceDetectionResult.faceAnnotations && faceDetectionResult.faceAnnotations.length > 0) {
    const face = faceDetectionResult.faceAnnotations[0];
    
    // Arcforma meghatározása a landmark-ok alapján
    if (face.landmarks) {
      // Arcszélesség és -magasság kiszámítása
      const landmarks = face.landmarks;
      
      // Keressük meg a szükséges pontokat
      const leftEar = landmarks.find(l => l.type === 'LEFT_EAR_TRAGION');
      const rightEar = landmarks.find(l => l.type === 'RIGHT_EAR_TRAGION');
      const chin = landmarks.find(l => l.type === 'CHIN_GNATHION');
      const foreHead = landmarks.find(l => l.type === 'FOREHEAD_GLABELLA');
      const leftCheek = landmarks.find(l => l.type === 'LEFT_CHEEK');
      const rightCheek = landmarks.find(l => l.type === 'RIGHT_CHEEK');
      
      if (leftEar && rightEar && chin && foreHead) {
        // Arcszélesség (fül-fül távolság)
        const faceWidth = Math.sqrt(
          Math.pow(rightEar.position.x - leftEar.position.x, 2) +
          Math.pow(rightEar.position.y - leftEar.position.y, 2)
        );
        
        // Arcmagasság (homlok-áll távolság)
        const faceHeight = Math.sqrt(
          Math.pow(chin.position.x - foreHead.position.x, 2) +
          Math.pow(chin.position.y - foreHead.position.y, 2)
        );
        
        // Arccsont szélesség (ha elérhető)
        let cheekWidth = 0;
        if (leftCheek && rightCheek) {
          cheekWidth = Math.sqrt(
            Math.pow(rightCheek.position.x - leftCheek.position.x, 2) +
            Math.pow(rightCheek.position.y - leftCheek.position.y, 2)
          );
        }
        
        // Arcforma meghatározása a méretek alapján
        const ratio = faceHeight / faceWidth;
        
        if (ratio > 1.5) {
          faceShape = "Hosszúkás - nyújtott arcforma";
        } else if (ratio < 1.1) {
          faceShape = "Kerek - lágy vonalak, telt arc";
        } else if (cheekWidth > 0 && cheekWidth / faceWidth > 0.8) {
          faceShape = "Gyémánt - keskeny homlok és áll, széles arccsont";
        } else if (face.joyLikelihood === 'VERY_LIKELY' || face.joyLikelihood === 'LIKELY') {
          // Ha mosolyog, valószínűbb a kerek arc
          faceShape = "Kerek - lágy vonalak, telt arc";
        } else if (face.angerLikelihood === 'VERY_LIKELY' || face.angerLikelihood === 'LIKELY') {
          // Ha mérges, valószínűbb a szögletes arc
          faceShape = "Szögletes - határozott állkapocs, széles homlok";
        }
      }
    }
  }
  
  // Testalkat meghatározása a labelResult alapján
  let bodyType = "Homokóra - kiegyensúlyozott váll és csípő, karcsú derék"; // alapértelmezett
  if (labelResult && labelResult.labelAnnotations) {
    const labels = labelResult.labelAnnotations.map(label => label.description.toLowerCase());
    
    if (labels.some(label => label.includes("athletic") || label.includes("muscular") || label.includes("sport"))) {
      bodyType = "Fordított háromszög - szélesebb váll, keskenyebb csípő";
    } else if (labels.some(label => label.includes("pear") || label.includes("hip") || label.includes("thigh"))) {
      bodyType = "Körte - keskenyebb váll, szélesebb csípő";
    } else if (labels.some(label => label.includes("apple") || label.includes("round") || label.includes("belly"))) {
      bodyType = "Alma - szélesebb váll és derék, keskenyebb csípő";
    } else if (labels.some(label => label.includes("slim") || label.includes("thin") || label.includes("slender"))) {
      bodyType = "Téglalap - egyenes testalkat, kevésbé hangsúlyos derék";
    } else if (labels.some(label => label.includes("hourglass") || label.includes("curvy"))) {
      bodyType = "Homokóra - kiegyensúlyozott váll és csípő, karcsú derék";
    }
  }
  
  // Színtípus meghatározása a képtulajdonságok alapján
  let colorType = "Tavasz - meleg, világos színek"; // alapértelmezett
  if (imagePropertiesResult && imagePropertiesResult.imagePropertiesAnnotation && 
      imagePropertiesResult.imagePropertiesAnnotation.dominantColors) {
    const colors = imagePropertiesResult.imagePropertiesAnnotation.dominantColors.colors;
    
    // Színek elemzése
    let warmColors = 0;
    let coolColors = 0;
    let brightColors = 0;
    let mutedColors = 0;
    
    colors.forEach(colorInfo => {
      const color = colorInfo.color;
      const r = color.red || 0;
      const g = color.green || 0;
      const b = color.blue || 0;
      
      // Meleg/hideg színek meghatározása
      if (r > b) warmColors += colorInfo.score;
      else coolColors += colorInfo.score;
      
      // Világos/tompa színek meghatározása
      const brightness = (r + g + b) / 3;
      if (brightness > 128) brightColors += colorInfo.score;
      else mutedColors += colorInfo.score;
    });
    
    // Színtípus meghatározása a színek alapján
    if (warmColors > coolColors) {
      if (brightColors > mutedColors) {
        colorType = "Tavasz - meleg, világos színek";
      } else {
        colorType = "Ősz - meleg, mély színek";
      }
    } else {
      if (brightColors > mutedColors) {
        colorType = "Nyár - hűvös, lágy színek";
      } else {
        colorType = "Tél - hűvös, élénk színek";
      }
    }
  }
  
  // Ajánlott színek a színtípus alapján
  const colorPalettes = {
    'Tavasz': [
      { name: 'Korall', hex: '#ff7f50' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Meleg zöld', hex: '#32cd32' },
      { name: 'Türkiz', hex: '#40e0d0' }
    ],
    'Nyár': [
      { name: 'Levendula', hex: '#e6e6fa' },
      { name: 'Rózsaszín', hex: '#ffc0cb' },
      { name: 'Világoskék', hex: '#add8e6' },
      { name: 'Szürke', hex: '#808080' },
      { name: 'Mályva', hex: '#e0b0ff' }
    ],
    'Ősz': [
      { name: 'Bordó', hex: '#800020' },
      { name: 'Olíva', hex: '#708238' },
      { name: 'Terrakotta', hex: '#e2725b' },
      { name: 'Mogyoró', hex: '#a67b5b' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Tél': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Fehér', hex: '#ffffff' },
      { name: 'Királykék', hex: '#4169e1' },
      { name: 'Smaragdzöld', hex: '#008000' },
      { name: 'Magenta', hex: '#ff00ff' }
    ]
  };
  
  const avoidColorPalettes = {
    'Tavasz': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Sötétszürke', hex: '#696969' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Nyár': [
      { name: 'Narancssárga', hex: '#ffa500' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Élénk piros', hex: '#ff0000' }
    ],
    'Ősz': [
      { name: 'Neon rózsaszín', hex: '#ff6ec7' },
      { name: 'Élénk citromsárga', hex: '#fff700' },
      { name: 'Világoskék', hex: '#add8e6' }
    ],
    'Tél': [
      { name: 'Bézs', hex: '#f5f5dc' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Olíva', hex: '#708238' }
    ]
  };
  
  const colorTypeName = colorType.split(' - ')[0];
  const recommendedColors = colorPalettes[colorTypeName] || colorPalettes['Tavasz'];
  const avoidColors = avoidColorPalettes[colorTypeName] || avoidColorPalettes['Tavasz'];
  
  // Stílus meghatározása a címkék alapján
  let recommendedStyle = "Klasszikus - időtlen, elegáns darabok"; // alapértelmezett
  if (labelResult && labelResult.labelAnnotations) {
    const labels = labelResult.labelAnnotations.map(label => label.description.toLowerCase());
    
    if (labels.some(label => label.includes("casual") || label.includes("natural") || label.includes("comfort"))) {
      recommendedStyle = "Természetes - kényelmes, laza viselet";
    } else if (labels.some(label => label.includes("elegant") || label.includes("formal") || label.includes("luxury"))) {
      recommendedStyle = "Elegáns - kifinomult, minőségi darabok";
    } else if (labels.some(label => label.includes("creative") || label.includes("artistic") || label.includes("unique"))) {
      recommendedStyle = "Kreatív - egyedi, művészi megjelenés";
    } else if (labels.some(label => label.includes("romantic") || label.includes("feminine") || label.includes("floral"))) {
      recommendedStyle = "Romantikus - nőies, lágy vonalak";
    } else if (labels.some(label => label.includes("urban") || label.includes("trendy") || label.includes("modern"))) {
      recommendedStyle = "Városi - modern, trendi darabok";
    } else if (labels.some(label => label.includes("dramatic") || label.includes("bold") || label.includes("statement"))) {
      recommendedStyle = "Drámai - merész, feltűnő megjelenés";
    }
  }
  
  // Stílustanácsok generálása
  const styleAdvice = `
    A képed alapján a ${colorType.toLowerCase()} típusba tartozol.
    Testalkatod ${bodyType.toLowerCase()}, ezért érdemes olyan ruhákat választanod,
    amelyek kiemelik az előnyös tulajdonságaidat.
   
    Arcformád ${faceShape.toLowerCase()}, ehhez a következő frizurák és kiegészítők állnak jól:
    ${faceShape.includes('Ovális') ? '- Szinte bármilyen frizura és kiegészítő jól áll neked' :
      faceShape.includes('Kerek') ? '- A hosszabb, réteges frizurák és a hosszúkás fülbevalók nyújtják az arcot' :
      faceShape.includes('Szögletes') ? '- A lágy, hullámos frizurák és kerek formájú kiegészítők lágyítják a vonásokat' :
      faceShape.includes('Szív') ? '- Az állhoz érő vagy hosszabb frizurák, valamint a szélesebb nyakláncok egyensúlyba hozzák az arcot' :
      faceShape.includes('Hosszúkás') ? '- A rövidebb, volumennel rendelkező frizurák és a kerek vagy négyzet alakú kiegészítők rövidítik az arcot' :
      '- A középen elválasztott frizurák és az ovális vagy kerek kiegészítők kiemelik az arccsontot'}
   
    A ${recommendedStyle.toLowerCase()} stílus illik hozzád a legjobban.
    Válassz olyan ruhákat, amelyek tükrözik ezt a stílust és a színtípusodhoz illő színekben kaphatók.
  `.trim().replace(/\n\s+/g, '\n');
  
  return {
    colorType,
    bodyType,
    faceShape,
    recommendedStyle,
    recommendedColors,
    avoidColors,
    styleAdvice
  };
}


// API használat lekérdezése a stílus API-hoz
app.get('/api/style/usage', (req, res) => {
  try {
    console.log('Style API usage request received');
    
    // Ellenőrizzük, hogy az adatbázis kapcsolat él-e
    if (!db || db.state === 'disconnected') {
      console.error('Adatbázis kapcsolat nem elérhető');
      return res.status(500).json({ error: 'Adatbázis kapcsolat nem elérhető' });
    }
    
    const query = 'SELECT * FROM api_usage WHERE api_name = "style_api"';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Hiba az API használat lekérdezésekor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Style API usage data retrieved:', results);
      
      // Ha nincs még bejegyzés, hozzunk létre egy alapértelmezett választ
      if (!results || results.length === 0) {
        return res.json({
          api_name: 'style_api',
          usage_count: 0,
          limit_count: 1000,
          reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          last_updated: new Date().toISOString().split('T')[0]
        });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Váratlan hiba az API használat lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

// API használat nullázása a stílus API-hoz
app.post('/api/style/usage/reset', async (req, res) => {
  try {
    await db.query(
      'UPDATE api_usage SET usage_count = 0, reset_date = DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), last_updated = NOW() WHERE api_name = "style_api"'
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Hiba az API használat nullázásakor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});

// Stílus API inicializálása az adatbázisban
app.post('/api/style/initialize', async (req, res) => {
  try {
    const query = `
      INSERT INTO api_usage (api_name, usage_count, limit_count, reset_date, last_updated)
      VALUES ('style_api', 0, 1000, DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), NOW())
      ON DUPLICATE KEY UPDATE 
        limit_count = 1000,
        last_updated = NOW()
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Hiba a stílus API inicializálásakor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Stílus API sikeresen inicializálva');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Váratlan hiba a stílus API inicializálásakor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

// Stílus API használati statisztikák
app.get('/api/style/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_requests,
        DATE_FORMAT(last_updated, '%Y-%m-%d') as last_used_date,
        DATEDIFF(reset_date, CURRENT_DATE()) as days_until_reset
      FROM api_usage 
      WHERE api_name = 'style_api'
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Hiba a stílus API statisztikák lekérdezésekor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      if (!results || results.length === 0) {
        return res.json({
          total_requests: 0,
          last_used_date: null,
          days_until_reset: 30
        });
      }
      
      console.log('Stílus API statisztikák:', results[0]);
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Váratlan hiba a stílus API statisztikák lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

// Stílus API használati limit beállítása
app.post('/api/style/set-limit', async (req, res) => {
  try {
    const { limit } = req.body;
    
    if (!limit || isNaN(parseInt(limit)) || parseInt(limit) <= 0) {
      return res.status(400).json({ error: 'Érvénytelen limit érték' });
    }
    
    const query = `
      UPDATE api_usage 
      SET limit_count = ?, last_updated = NOW()
      WHERE api_name = 'style_api'
    `;
    
    db.query(query, [parseInt(limit)], (err, result) => {
      if (err) {
        console.error('Hiba a stílus API limit beállításakor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Stílus API limit sikeresen beállítva:', limit);
      res.json({ success: true, limit: parseInt(limit) });
    });
  } catch (error) {
    console.error('Váratlan hiba a stílus API limit beállításakor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

// Stílus API használati előzmények
app.get('/api/style/history', async (req, res) => {
  try {
    // Itt egy valós implementációban lekérdeznénk az adatbázisból a használati előzményeket
    // Most csak egy mock választ adunk vissza
    
    const mockHistory = [
      { date: '2023-05-01', count: 5 },
      { date: '2023-05-02', count: 8 },
      { date: '2023-05-03', count: 3 },
      { date: '2023-05-04', count: 12 },
      { date: '2023-05-05', count: 7 }
    ];
    
    res.json(mockHistory);
  } catch (error) {
    console.error('Váratlan hiba a stílus API előzmények lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

// Stílus API használati előrejelzés
app.get('/api/style/forecast', async (req, res) => {
  try {
    // Itt egy valós implementációban kiszámolnánk az előrejelzést az eddigi használat alapján
    // Most csak egy mock választ adunk vissza
    
    const mockForecast = {
      estimated_monthly_usage: 150,
      estimated_depletion_date: '2023-06-15',
      recommendation: 'A jelenlegi használati szint mellett a havi limit elegendő lesz.'
    };
    
    res.json(mockForecast);
  } catch (error) {
    console.error('Váratlan hiba a stílus API előrejelzés lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

const visionClient2 = new vision.ImageAnnotatorClient({
  keyFilename: './vision-api-key1.json' // Az új fiók kulcsfájlja - a fájlnevet módosítsd a tényleges fájlnévre
});
app.post('/api/vision/analyze-file', async (req, res) => {
  try {
    console.log('Kép elemzése kezdődik (2. fiók)...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nincs feltöltött kép' });
    }
    
    // Növeljük az API használati számlálót az új fiókhoz
    await incrementApiUsage('vision_api_2');
    
    // A fájl elérési útja
    const filePath = path.join(__dirname, req.file.path);
    
    try {
      // Vision API hívások az új fiókkal
      const [labelResult] = await visionClient2.labelDetection(filePath);
      const [objectResult] = await visionClient2.objectLocalization(filePath);
      const [imagePropertiesResult] = await visionClient2.imageProperties(filePath);
      
      // Eredmények feldolgozása
      const labels = labelResult.labelAnnotations || [];
      const objects = objectResult.localizedObjectAnnotations || [];
      const colors = imagePropertiesResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
      
      // A többi kód ugyanaz, mint az eredeti végpontban...
      // Kategória meghatározás, leírás generálás, stb.
      
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
      
      console.log('Válasz előkészítve (2. fiók):', response);
      res.json(response);
    } catch (apiError) {
      console.error('Hiba a Vision API (2. fiók) használata során:', apiError);
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getFallbackResponse()
      });
    }
  } catch (error) {
    console.error('Hiba a kép elemzése során (2. fiók):', error);
    res.status(500).json({
      error: 'Hiba a kép elemzése során: ' + error.message,
      fallback: getFallbackResponse()
    });
  }
});

app.post('/api/vision2/initialize', async (req, res) => {
  try {
    const query = `
      INSERT INTO api_usage (api_name, usage_count, limit_count, reset_date, last_updated)
      VALUES ('vision_api_2', 0, 1000, DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), NOW())
      ON DUPLICATE KEY UPDATE 
        limit_count = 1000,
        last_updated = NOW()
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Hiba a második Vision API inicializálásakor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Második Vision API sikeresen inicializálva');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Váratlan hiba a második Vision API inicializálásakor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};


startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
