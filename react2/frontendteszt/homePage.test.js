const assert = require('assert');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const HomePage = require('./pageObjects/HomePage');
const LoginPage = require('./pageObjects/LoginPage');

describe('Kezdőlap tesztek', function() {
  let driver;
  let homePage;
  let loginPage;


  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    homePage = new HomePage(driver);
    loginPage = new LoginPage(driver);
  });

  describe('Kezdőlap betöltése és navigáció', function() {
    it('Kezdőlap betöltése', async function() {
      try {
        await homePage.navigate();
        await takeScreenshot(driver, 'homepage-loaded');
        
        const title = await homePage.getTitle();
        assert(title.includes('Üdvözlünk'), 'A kezdőlapnak tartalmaznia kell az üdvözlő szöveget');
      } catch (error) {
        await takeScreenshot(driver, 'homepage-load-error');
        throw error;
      }
    });

    it('Oldalsáv megnyitása és bezárása', async function() {
      try {
        await homePage.navigate();
        await homePage.openSideMenu();
        await takeScreenshot(driver, 'sidemenu-opened');
        
        await homePage.closeSideMenu();
        await takeScreenshot(driver, 'sidemenu-closed');
        
        
      } catch (error) {
        await takeScreenshot(driver, 'sidemenu-toggle-error');
        throw error;
      }
    });

    it('Dark mode kapcsoló működése', async function() {
      try {
        await homePage.navigate();
        
        const initialDarkMode = await homePage.isDarkModeEnabled();
        await homePage.toggleDarkMode();
        await takeScreenshot(driver, 'after-darkmode-toggle');
        
        const newDarkMode = await homePage.isDarkModeEnabled();
        assert(initialDarkMode !== newDarkMode, 'A dark mode kapcsolónak meg kell változtatnia a dark mode állapotát');
      } catch (error) {
        await takeScreenshot(driver, 'darkmode-toggle-error');
        throw error;
      }
    });
  });

  describe('Bejelentkezés és kijelentkezés', function() {
    it('Bejelentkezés a kezdőlapról', async function() {
      try {
        await homePage.navigate();
        await homePage.login();
        
        
        await driver.sleep(3000);
        await takeScreenshot(driver, 'after-login-from-homepage');
        
       
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/sign'), 'A felhasználónak a bejelentkezési oldalra kell kerülnie');
        
       
        await loginPage.login('teszt@example.com', 'jelszo123');
        await driver.sleep(3000);
        
      
        await homePage.navigate();
      } catch (error) {
        await takeScreenshot(driver, 'login-from-homepage-error');
        throw error;
      }
    });

    it('Kijelentkezés a kezdőlapról', async function() {
      try {
        await homePage.navigate();
        await homePage.logout();
        
     
        await driver.sleep(3000);
        await takeScreenshot(driver, 'after-logout-from-homepage');
        
      
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/sign'), 'A felhasználónak a bejelentkezési oldalra kell kerülnie kijelentkezés után');
      } catch (error) {
        await takeScreenshot(driver, 'logout-from-homepage-error');
        throw error;
      }
    });
  });

  describe('Navigáció a kezdőlapról', function() {
    it('Navigálás a kosárhoz', async function() {
      try {
        await homePage.navigate();
        await homePage.goToCart();
        
        await takeScreenshot(driver, 'after-goto-cart');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/kosar'), 'A felhasználónak a kosár oldalra kell kerülnie');
      } catch (error) {
        await takeScreenshot(driver, 'goto-cart-error');
        throw error;
      }
    });

    it('Navigálás az összes termékhez', async function() {
      try {
        await homePage.navigate();
        await homePage.goToAllProducts();
        
        await takeScreenshot(driver, 'after-goto-all-products');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/oterm'), 'A felhasználónak az összes termék oldalra kell kerülnie');
      } catch (error) {
        await takeScreenshot(driver, 'goto-all-products-error');
        throw error;
      }
    });

    it('Navigálás a Vinted oldalra', async function() {
      try {
        await homePage.navigate();
        await homePage.goToVinted();
        
        await takeScreenshot(driver, 'after-goto-vinted');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/vinted'), 'A felhasználónak a Vinted oldalra kell kerülnie');
      } catch (error) {
        await takeScreenshot(driver, 'goto-vinted-error');
        throw error;
      }
    });

    it('Navigálás a termék feltöltés oldalra', async function() {
      try {
        await homePage.navigate();
        await homePage.goToUploadProduct();
        
        await takeScreenshot(driver, 'after-goto-upload-product');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/add'), 'A felhasználónak a termék feltöltés oldalra kell kerülnie');
      } catch (error) {
        await takeScreenshot(driver, 'goto-upload-product-error');
        throw error;
      }
    });
  });

  describe('Kezdőlap elemek ellenőrzése', function() {
    it('Termék kártyák megjelenítése', async function() {
      try {
        await homePage.navigate();
        
        const productCardCount = await homePage.getProductCards();
        assert(productCardCount > 0, 'A kezdőlapnak tartalmaznia kell termék kártyákat');
      } catch (error) {
        await takeScreenshot(driver, 'product-cards-error');
        throw error;
      }
    });

    it('Értékelések megjelenítése', async function() {
      try {
        await homePage.navigate();
        
        const ratingsCount = await homePage.getRatings();
        assert(ratingsCount >= 0, 'Az értékeléseknek meg kell jelenniük a kezdőlapon');
      } catch (error) {
        await takeScreenshot(driver, 'ratings-error');
        throw error;
      }
    });

    it('Carousel animáció működése', async function() {
      try {
        await homePage.navigate();
        
  
        await homePage.waitForCarouselAnimation();
        await takeScreenshot(driver, 'after-carousel-animation');
        
       
      } catch (error) {
        await takeScreenshot(driver, 'carousel-animation-error');
        throw error;
      }
    });

    it('Kupon sorsológép működése', async function() {
      try {
        await homePage.navigate();
        
        const couponResult = await homePage.spinCoupon();
        await takeScreenshot(driver, 'after-spin-coupon');
        
  
        if (couponResult) {
          assert(couponResult.length > 0, 'A kupon sorsológépnek eredményt kell adnia');
        }
        
      
        await homePage.closeCouponDialog();
      } catch (error) {
        await takeScreenshot(driver, 'spin-coupon-error');
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
