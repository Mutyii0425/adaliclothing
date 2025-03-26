const assert = require('assert');
const path = require('path');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const AddProductPage = require('./pageObjects/AddProductPage');

describe('Termék hozzáadás tesztek', function() {
  let driver;
  let loginPage;
  let addProductPage;

 
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    addProductPage = new AddProductPage(driver);
    
   
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); 
  });

  describe('Termék hozzáadás űrlap', function() {
    it('Termék hozzáadás oldal betöltése', async function() {
      try {
        await addProductPage.navigate();
        
        
        await takeScreenshot(driver, 'add-product-page-loaded');
        
       
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/add'), 'A felhasználónak a termék hozzáadás oldalon kellene lennie');
      } catch (error) {
        await takeScreenshot(driver, 'add-product-page-error');
        throw error;
      }
    });

    it('Űrlap validáció - üres mezők', async function() {
      try {
        
        await addProductPage.submitForm();
        
     
        await takeScreenshot(driver, 'add-product-empty-validation');
        
        
        const errors = await addProductPage.getErrors();
        console.log('Validációs hibák:', errors);
        
        
        assert(Object.keys(errors).length > 0, 'Hibaüzeneteknek meg kellene jelenniük');
      } catch (error) {
        await takeScreenshot(driver, 'add-product-validation-error');
        throw error;
      }
    });

    it('Képfeltöltés tesztelése', async function() {
      try {
      
        await addProductPage.clickUploadArea();
        
       
        const testImagePaths = [
          '../testdata/test-image1.jpg',
          '../testdata/test-image2.jpg'
        ];
        
        await addProductPage.uploadImages(testImagePaths);
        
       
        await takeScreenshot(driver, 'add-product-images-uploaded');
        
      } catch (error) {
        await takeScreenshot(driver, 'add-product-image-upload-error');
        console.error('Hiba a képfeltöltés során:', error);
       
      }
    });

    it('Sikeres termék hozzáadás', async function() {
      try {
        
        await addProductPage.setTitle('Teszt Termék ' + Date.now());
        await addProductPage.setPrice('5000');
        await addProductPage.setDescription('Ez egy teszt termék leírása, amit az automatizált teszt hozott létre.');
        await addProductPage.selectCategory('Ruha');
        await addProductPage.selectSize('M');
      
        await takeScreenshot(driver, 'add-product-form-filled');
        
      
        await addProductPage.submitForm();
        
       
        await takeScreenshot(driver, 'add-product-form-submitted');
        
       
        const isSuccessful = await addProductPage.isSubmissionSuccessful();
        assert(isSuccessful, 'A termék hozzáadásának sikeresnek kellene lennie');
      } catch (error) {
        await takeScreenshot(driver, 'add-product-submission-error');
        throw error;
      }
    });

    it('Dark mode kapcsoló tesztelése', async function() {
      try {
        
        await addProductPage.navigate();
        
        
        await takeScreenshot(driver, 'add-product-before-dark-mode');
        
        
        await addProductPage.toggleDarkMode();
        
    
        await takeScreenshot(driver, 'add-product-dark-mode');
        
       
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