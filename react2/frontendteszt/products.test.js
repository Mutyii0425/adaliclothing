const assert = require('assert');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const ProductPage = require('./pageObjects/ProductPage');

describe('Termék részletek tesztek', function() {
  let driver;
  let loginPage;
  let productPage;

  // Teszt timeout beállítása
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    productPage = new ProductPage(driver);
    
    // Bejelentkezés a termék tesztek előtt
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); // Várjunk az átirányításra
    
    // Navigáljunk egy termék oldalra
    await driver.get('http://localhost:3000/termekekk/1');
    await driver.sleep(2000);
  });

  describe('Termék részletek megjelenítése', function() {
    it('Termék adatok betöltése', async function() {
      try {
        // Ellenőrizzük, hogy a termék adatok megjelennek
        const title = await productPage.getProductTitle();
        const price = await productPage.getProductPrice();
        const description = await productPage.getProductDescription();
        
        console.log('Termék címe:', title);
        console.log('Termék ára:', price);
        console.log('Termék leírása:', description);
        
        // Ellenőrizzük, hogy az adatok nem üresek
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
        // Próbáljuk meg kosárba helyezni a terméket méret kiválasztása nélkül
        await productPage.addToCart();
        
        // Ellenőrizzük, hogy megjelenik-e hibaüzenet
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
        // Válasszunk méretet
        await productPage.selectSize('M');
        
        // Helyezzük kosárba a terméket
        await productPage.addToCart();
        
        // Ellenőrizzük, hogy megjelenik-e a sikeres kosárba helyezés üzenet
        const isSuccessAlertDisplayed = await productPage.isCartSuccessAlertDisplayed();
        
        assert(isSuccessAlertDisplayed, 'Sikeres kosárba helyezés üzenetnek meg kellene jelennie');
        
        await takeScreenshot(driver, 'product-added-to-cart');
        
        // Folytassuk a vásárlást
        await productPage.continueShopping();
      } catch (error) {
        await takeScreenshot(driver, 'product-add-to-cart-error');
        throw error;
      }
    });

    it('Dark mode kapcsoló tesztelése', async function() {
      try {
        // Képernyőkép készítése az eredeti állapotról
        await takeScreenshot(driver, 'product-before-dark-mode');
        
        // Kapcsoljuk be a dark mode-ot
        await productPage.toggleDarkMode();
        
        // Képernyőkép készítése a dark mode-ban
        await takeScreenshot(driver, 'product-dark-mode');
        
        // Kapcsoljuk vissza az eredeti állapotba
        await productPage.toggleDarkMode();
      } catch (error) {
        await takeScreenshot(driver, 'product-dark-mode-error');
        console.error('Hiba a dark mode tesztelése során:', error);
      }
    });

    it('Oldalsó menü tesztelése', async function() {
      try {
        // Nyissuk meg az oldalsó menüt
        await productPage.openSideMenu();
        
        // Képernyőkép készítése a nyitott menüről
        await takeScreenshot(driver, 'product-side-menu-open');
        
        // Zárjuk be a menüt
        await productPage.closeSideMenu();
      } catch (error) {
        await takeScreenshot(driver, 'product-side-menu-error');
        console.error('Hiba az oldalsó menü tesztelése során:', error);
      }
    });

    it('Kosár oldal megnyitása', async function() {
      try {
        // Nyissuk meg a kosár oldalt
        await productPage.goToCart();
        
        // Ellenőrizzük, hogy a kosár oldalra kerültünk
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/kosar'), 'A felhasználónak a kosár oldalra kellene átirányítódnia');
        
        await takeScreenshot(driver, 'product-to-cart-navigation');
        
        // Navigáljunk vissza a termék oldalra
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
        // Nyissuk meg a profil menüt
        await productPage.openProfileMenu();
        
        // Kattintsunk a kijelentkezés gombra
        await waitAndClick(driver, By.xpath("//li[contains(text(), 'Kijelentkezés')]"));
        
        // Várjunk a kijelentkezés megerősítő ablakra
        await driver.sleep(1000);
        
        // Erősítsük meg a kijelentkezést
        await waitAndClick(driver, By.xpath("//button[contains(text(), 'Kijelentkezés')]"));
        
        // Várjunk az átirányításra
        await driver.sleep(2000);
        
        // Ellenőrizzük, hogy a bejelentkezési oldalra kerültünk
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
        // Navigáljunk vissza egy termék oldalra
        await driver.get('http://localhost:3000/termek/1');
        await driver.sleep(2000);
        
        // Válasszunk méretet
        await productPage.selectSize('M');
        
        // Próbáljuk meg kosárba helyezni a terméket
        await productPage.addToCart();
        
        // Ellenőrizzük, hogy megjelenik-e a bejelentkezési figyelmeztetés
        const isLoginAlertDisplayed = await productPage.isLoginAlertDisplayed();
        
        assert(isLoginAlertDisplayed, 'Bejelentkezési figyelmeztetésnek meg kellene jelennie');
        
        await takeScreenshot(driver, 'product-login-alert');
        
        // Várjunk az átirányításra
        await driver.sleep(3000);
        
        // Ellenőrizzük, hogy a bejelentkezési oldalra kerültünk
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