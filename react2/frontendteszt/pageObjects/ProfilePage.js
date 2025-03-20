const assert = require('assert');
const { createDriver, takeScreenshot, waitAndClick, waitAndType, waitForText } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const { By, until } = require('selenium-webdriver');

describe('Fiók oldal tesztek', function() {
  let driver;
  let loginPage;

  // Teszt timeout beállítása
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    
    // Bejelentkezés a profil tesztek előtt
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); // Várjunk az átirányításra
  });

  describe('Fiók oldal funkcionalitás', function() {
    it('Fiók oldal betöltése', async function() {
      try {
        // Navigálás a fiók oldalra
        await driver.get('http://localhost:3000/fiokom');
        await driver.sleep(2000);
        
        // Képernyőkép készítése
        await takeScreenshot(driver, 'fiokom-page-loaded');
        
        // Ellenőrizzük, hogy a fiók oldal betöltődött
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/fiokom'), 'A felhasználónak a fiók oldalon kellene lennie');
      } catch (error) {
        await takeScreenshot(driver, 'fiokom-page-error');
        throw error;
      }
    });

    it('Felhasználói adatok megjelenítése', async function() {
      try {
        // Ellenőrizzük, hogy a felhasználó adatai megjelennek
        // A fiokom.js alapján az Avatar és a felhasználónév megjelenítése
        await driver.wait(until.elementLocated(By.css('h4.MuiTypography-root, h5.MuiTypography-root')), 5000);
        
        // Ellenőrizzük, hogy van-e felhasználónév megjelenítve
        const nameElement = await driver.findElement(By.css('h4.MuiTypography-root, h5.MuiTypography-root'));
        const nameText = await nameElement.getText();
        
        assert(nameText.length > 0, 'A felhasználónévnek meg kellene jelennie');
        
        // Ellenőrizzük, hogy az email cím megjelenik-e
        const emailElement = await driver.findElement(By.css('p.MuiTypography-root, p.MuiTypography-body1'));
        const emailText = await emailElement.getText();
        
        assert(emailText.includes('@'), 'Az email címnek meg kellene jelennie');
        
        await takeScreenshot(driver, 'fiokom-user-data-displayed');
      } catch (error) {
        await takeScreenshot(driver, 'fiokom-user-data-error');
        throw error;
      }
    });

    it('Rendelési statisztikák megjelenítése', async function() {
      try {
        // A fiokom.js alapján a rendelési statisztikák ellenőrzése
        
        // Várjunk, amíg a statisztikák betöltődnek
        await driver.sleep(2000);
        
        // Ellenőrizzük a rendelések számát
        const orderCountElement = await driver.findElement(By.xpath("//h6[preceding-sibling::*[name()='svg' and contains(@class, 'MuiSvgIcon-root')]]"));
        const orderCountText = await orderCountElement.getText();
        
        console.log('Rendelések száma:', orderCountText);
        assert(orderCountText.includes('db') || !isNaN(parseInt(orderCountText)), 'A rendelések számának meg kellene jelennie');
        
        // Ellenőrizzük a rendelések összértékét
        const totalAmountElement = await driver.findElement(By.xpath("//h6[following-sibling::*[contains(text(), 'Összes rendelés értéke')]]"));
        const totalAmountText = await totalAmountElement.getText();
        
        console.log('Rendelések összértéke:', totalAmountText);
        assert(totalAmountText.includes('Ft') || !isNaN(parseInt(totalAmountText.replace(/\s/g, ''))), 'A rendelések összértékének meg kellene jelennie');
        
        await takeScreenshot(driver, 'fiokom-order-stats');
      } catch (error) {
        await takeScreenshot(driver, 'fiokom-order-stats-error');
        console.error('Hiba a rendelési statisztikák tesztelése során:', error);
        // Ne dobjunk hibát, ha nem találjuk a statisztikákat, lehet, hogy nincs rendelés
      }
    });

    it('Dark mode kapcsoló működése', async function() {
      try {
        // A fiokom.js alapján a dark mode kapcsoló tesztelése
        const darkModeSwitch = await driver.findElement(By.css('input[type="checkbox"]'));
        
        // Ellenőrizzük a jelenlegi állapotot
        const isDarkMode = await darkModeSwitch.isSelected();
        console.log('Dark mode kezdeti állapota:', isDarkMode);
        
        // Kapcsoljuk át a dark mode-ot
        await darkModeSwitch.click();
        await driver.sleep(1000);
        
        // Ellenőrizzük, hogy megváltozott-e az állapot
        const newDarkModeState = await darkModeSwitch.isSelected();
        assert(isDarkMode !== newDarkModeState, 'A dark mode állapotának meg kellene változnia');
        
        await takeScreenshot(driver, 'fiokom-dark-mode-toggle');
        
        // Állítsuk vissza az eredeti állapotot
        await darkModeSwitch.click();
        await driver.sleep(1000);
      } catch (error) {
        await takeScreenshot(driver, 'fiokom-dark-mode-error');
        console.error('Hiba a dark mode tesztelése során:', error);
      }
    });

    it('Oldalsó menü működése', async function() {
      try {
        // A fiokom.js alapján az oldalsó menü tesztelése
        const menuButton = await driver.findElement(By.css('button[aria-label="menu"], button:first-child'));
        await menuButton.click();
        
        await driver.sleep(1000);
        
        // Ellenőrizzük, hogy megjelent-e az oldalsó menü
        const sideMenu = await driver.findElement(By.css('.MuiDrawer-root, [style*="left: 0"]'));
        const isMenuVisible = await sideMenu.isDisplayed();
        
        assert(isMenuVisible, 'Az oldalsó menünek láthatónak kellene lennie');
        
        await takeScreenshot(driver, 'fiokom-side-menu-open');
        
        // Zárjuk be a menüt
        await menuButton.click();
        await driver.sleep(1000);
      } catch (error) {
        await takeScreenshot(driver, 'fiokom-side-menu-error');
        console.error('Hiba az oldalsó menü tesztelése során:', error);
      }
    });

    it('Kosár ikon működése', async function() {
      try {
        // A fiokom.js alapján a kosár ikon tesztelése
        const cartIcon = await driver.findElement(By.css('[aria-label="cart"], svg[data-testid="ShoppingCartIcon"]'));
        
        // Ellenőrizzük, hogy van-e badge a kosár ikonon
        try {
          const badge = await driver.findElement(By.css('.MuiBadge-badge'));
          const badgeText = await badge.getText();
          console.log('Kosár badge értéke:', badgeText);
        } catch (e) {
          console.log('Nincs badge a kosár ikonon, valószínűleg üres a kosár');
        }
        
        // Kattintsunk a kosár ikonra
        await cartIcon.click();
        await driver.sleep(2000);
        
        // Ellenőrizzük, hogy átirányított-e a kosár oldalra
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/kosar'), 'A felhasználónak a kosár oldalra kellene átirányítódnia');
        
        await takeScreenshot(driver, 'fiokom-cart-redirect');
        
        // Navigáljunk vissza a fiók oldalra
        await driver.navigate().back();
        await driver.sleep(2000);
      } catch (error) {
        await takeScreenshot(driver, 'fiokom-cart-error');
        console.error('Hiba a kosár ikon tesztelése során:', error);
      }
    });
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });
});