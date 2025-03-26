const assert = require('assert');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const ProductPage = require('./pageObjects/ProductPage');

describe('Termék részletek tesztek', function() {
  let driver;
  let loginPage;
  let productPage;


  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    productPage = new ProductPage(driver);
    
   
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); 
    
    
    await driver.get('http://localhost:3000/termekekk/1');
    await driver.sleep(2000);
  });

  describe('Termék részletek megjelenítése', function() {
    it('Termék adatok betöltése', async function() {
      try {
      
        const title = await productPage.getProductTitle();
        const price = await productPage.getProductPrice();
        const description = await productPage.getProductDescription();
        
        console.log('Termék címe:', title);
        console.log('Termék ára:', price);
        console.log('Termék leírása:', description);
        
       
        assert(title.length > 0, 'A termék címének meg kellene jelennie');
        assert(price.length > 0, 'A termék árának meg kellene jelennie');
        assert(description.length > 0, 'A termék leírásának meg kellene jelennie');
        
        await takeScreenshot(driver, 'product-details-loaded');
      } catch (error) {
        await takeScreenshot(driver, 'product-details-error');
        throw error;
      }
    });

    it('Méret kiválasztása nélküli kosárba helyezés', async function() {
      try {
      
        await productPage.addToCart();
        
    
        const sizeError = await productPage.getSizeError();
        console.log('Méret hiba:', sizeError);
        
        assert(sizeError !== null, 'Hibaüzenetnek meg kellene jelennie méret kiválasztása nélkül');
        
        await takeScreenshot(driver, 'product-size-error');
      } catch (error) {
        await takeScreenshot(driver, 'product-size-error-test-failed');
        throw error;
      }
    });

    it('Sikeres kosárba helyezés', async function() {
      try {
        
        await productPage.selectSize('M');
      
        await productPage.addToCart();
      
        const isSuccessAlertDisplayed = await productPage.isCartSuccessAlertDisplayed();
        
        assert(isSuccessAlertDisplayed, 'Sikeres kosárba helyezés üzenetnek meg kellene jelennie');
        
        await takeScreenshot(driver, 'product-added-to-cart');
        
        
        await productPage.continueShopping();
      } catch (error) {
        await takeScreenshot(driver, 'product-add-to-cart-error');
        throw error;
      }
    });

    it('Dark mode kapcsoló tesztelése', async function() {
      try {
        
        await takeScreenshot(driver, 'product-before-dark-mode');
        
       
        await productPage.toggleDarkMode();
      
        await takeScreenshot(driver, 'product-dark-mode');
        
        
        await productPage.toggleDarkMode();
      } catch (error) {
        await takeScreenshot(driver, 'product-dark-mode-error');
        console.error('Hiba a dark mode tesztelése során:', error);
      }
    });

    it('Oldalsó menü tesztelése', async function() {
      try {
  
        await productPage.openSideMenu();
        
        
        await takeScreenshot(driver, 'product-side-menu-open');
        
        
        await productPage.closeSideMenu();
      } catch (error) {
        await takeScreenshot(driver, 'product-side-menu-error');
        console.error('Hiba az oldalsó menü tesztelése során:', error);
      }
    });

    it('Kosár oldal megnyitása', async function() {
      try {
        
        await productPage.goToCart();
    
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/kosar'), 'A felhasználónak a kosár oldalra kellene átirányítódnia');
        
        await takeScreenshot(driver, 'product-to-cart-navigation');
        
      
        await driver.navigate().back();
        await driver.sleep(2000);
      } catch (error) {
        await takeScreenshot(driver, 'product-to-cart-navigation-error');
        throw error;
      }
    });
  });

  describe('Nem bejelentkezett felhasználó tesztek', function() {
    it('Kijelentkezés', async function() {
      try {
    
        await productPage.openProfileMenu();
        
        
        await waitAndClick(driver, By.xpath("//li[contains(text(), 'Kijelentkezés')]"));
        
       
        await driver.sleep(1000);
        
        
        await waitAndClick(driver, By.xpath("//button[contains(text(), 'Kijelentkezés')]"));
        
      
        await driver.sleep(2000);
        
       
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/sign'), 'A felhasználónak a bejelentkezési oldalra kellene átirányítódnia');
        
        await takeScreenshot(driver, 'product-logged-out');
      } catch (error) {
        await takeScreenshot(driver, 'product-logout-error');
        console.error('Hiba a kijelentkezés során:', error);
      }
    });

    it('Nem bejelentkezett felhasználó kosárba helyezési kísérlete', async function() {
      try {
       
        await driver.get('http://localhost:3000/termek/1');
        await driver.sleep(2000);
        
      
        await productPage.selectSize('M');
        
       
        await productPage.addToCart();
        
        
        const isLoginAlertDisplayed = await productPage.isLoginAlertDisplayed();
        
        assert(isLoginAlertDisplayed, 'Bejelentkezési figyelmeztetésnek meg kellene jelennie');
        
        await takeScreenshot(driver, 'product-login-alert');
        
   
        await driver.sleep(3000);
        
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/sign'), 'A felhasználónak a bejelentkezési oldalra kellene átirányítódnia');
      } catch (error) {
        await takeScreenshot(driver, 'product-login-alert-error');
        throw error;
      }
    });
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });
});