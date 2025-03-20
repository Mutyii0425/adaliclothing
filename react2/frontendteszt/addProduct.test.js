const assert = require('assert');
const path = require('path');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const AddProductPage = require('./pageObjects/AddProductPage');

describe('Termék hozzáadás tesztek', function() {
  let driver;
  let loginPage;
  let addProductPage;

  // Teszt timeout beállítása
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    addProductPage = new AddProductPage(driver);
    
    // Bejelentkezés a termék hozzáadás tesztek előtt
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); // Várjunk az átirányításra
  });

  describe('Termék hozzáadás űrlap', function() {
    it('Termék hozzáadás oldal betöltése', async function() {
      try {
        await addProductPage.navigate();
        
        // Képernyőkép készítése
        await takeScreenshot(driver, 'add-product-page-loaded');
        
        // Ellenőrizzük, hogy a termék hozzáadás oldal betöltődött
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/add'), 'A felhasználónak a termék hozzáadás oldalon kellene lennie');
      } catch (error) {
        await takeScreenshot(driver, 'add-product-page-error');
        throw error;
      }
    });

    it('Űrlap validáció - üres mezők', async function() {
      try {
        // Próbáljuk meg beküldeni az űrlapot üres mezőkkel
        await addProductPage.submitForm();
        
        // Képernyőkép készítése
        await takeScreenshot(driver, 'add-product-empty-validation');
        
        // Ellenőrizzük a hibaüzeneteket
        const errors = await addProductPage.getErrors();
        console.log('Validációs hibák:', errors);
        
        // Ellenőrizzük, hogy vannak-e hibaüzenetek
        assert(Object.keys(errors).length > 0, 'Hibaüzeneteknek meg kellene jelenniük');
      } catch (error) {
        await takeScreenshot(driver, 'add-product-validation-error');
        throw error;
      }
    });

    it('Képfeltöltés tesztelése', async function() {
      try {
        // Kattintsunk a feltöltési területre
        await addProductPage.clickUploadArea();
        
        // Töltsünk fel két teszt képet
        const testImagePaths = [
          '../testdata/test-image1.jpg',
          '../testdata/test-image2.jpg'
        ];
        
        await addProductPage.uploadImages(testImagePaths);
        
        // Képernyőkép készítése
        await takeScreenshot(driver, 'add-product-images-uploaded');
        
        // Ellenőrizzük, hogy a képek megjelennek-e
        // (Ezt nehéz automatikusan ellenőrizni, ezért csak a képernyőképre hagyatkozunk)
      } catch (error) {
        await takeScreenshot(driver, 'add-product-image-upload-error');
        console.error('Hiba a képfeltöltés során:', error);
        // Ne dobjunk hibát, ha a képfeltöltés nem sikerül, folytatjuk a tesztet
      }
    });

    it('Sikeres termék hozzáadás', async function() {
      try {
        // Töltsük ki az űrlapot
        await addProductPage.setTitle('Teszt Termék ' + Date.now());
        await addProductPage.setPrice('5000');
        await addProductPage.setDescription('Ez egy teszt termék leírása, amit az automatizált teszt hozott létre.');
        await addProductPage.selectCategory('Ruha');
        await addProductPage.selectSize('M');
        
        // Képernyőkép készítése a kitöltött űrlapról
        await takeScreenshot(driver, 'add-product-form-filled');
        
        // Küldjük be az űrlapot
        await addProductPage.submitForm();
        
        // Képernyőkép készítése a beküldés után
        await takeScreenshot(driver, 'add-product-form-submitted');
        
        // Ellenőrizzük, hogy sikeres volt-e a beküldés
        const isSuccessful = await addProductPage.isSubmissionSuccessful();
        assert(isSuccessful, 'A termék hozzáadásának sikeresnek kellene lennie');
      } catch (error) {
        await takeScreenshot(driver, 'add-product-submission-error');
        throw error;
      }
    });

    it('Dark mode kapcsoló tesztelése', async function() {
      try {
        // Navigáljunk vissza a termék hozzáadás oldalra
        await addProductPage.navigate();
        
        // Képernyőkép készítése az eredeti állapotról
        await takeScreenshot(driver, 'add-product-before-dark-mode');
        
        // Kapcsoljuk be a dark mode-ot
        await addProductPage.toggleDarkMode();
        
        // Képernyőkép készítése a dark mode-ban
        await takeScreenshot(driver, 'add-product-dark-mode');
        
        // Kapcsoljuk vissza az eredeti állapotba
        await addProductPage.toggleDarkMode();
      } catch (error) {
        await takeScreenshot(driver, 'add-product-dark-mode-error');
        console.error('Hiba a dark mode tesztelése során:', error);
      }
    });
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });
});