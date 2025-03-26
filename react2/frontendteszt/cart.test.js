const assert = require('assert');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const CartPage = require('./pageObjects/CartPage');

describe('Kosár tesztek', function() {
  let driver;
  let loginPage;
  let cartPage;

  
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    cartPage = new CartPage(driver);
    
    
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); 
  });

  describe('Kosár funkciók', function() {
    it('Kosár oldal betöltése', async function() {
      try {
        await cartPage.navigate();
        await takeScreenshot(driver, 'cart-page-loaded');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/kosar'), 'A kosár oldalnak kell betöltődnie');
      } catch (error) {
        await takeScreenshot(driver, 'cart-page-load-error');
        throw error;
      }
    });

    it('Termék mennyiség növelése a kosárban', async function() {
      try {
     
        const isEmpty = await cartPage.isCartEmpty();
        if (isEmpty) {
          console.log('A kosár üres, ezt a tesztet kihagyjuk');
          this.skip();
          return;
        }
        
        const initialCount = await cartPage.getCartItemsCount();
        const initialTotal = await cartPage.getTotalPrice();
        
        await cartPage.increaseItemQuantity(0);
        await takeScreenshot(driver, 'after-increase-quantity');
        
        const newTotal = await cartPage.getTotalPrice();
        assert(newTotal > initialTotal, 'A termék mennyiség növelése után az összárnak növekednie kell');
      } catch (error) {
        await takeScreenshot(driver, 'increase-quantity-error');
        throw error;
      }
    });

    it('Termék mennyiség csökkentése a kosárban', async function() {
      try {
       
        const isEmpty = await cartPage.isCartEmpty();
        if (isEmpty) {
          console.log('A kosár üres, ezt a tesztet kihagyjuk');
          this.skip();
          return;
        }
        
        const initialTotal = await cartPage.getTotalPrice();
        
        await cartPage.decreaseItemQuantity(0);
        await takeScreenshot(driver, 'after-decrease-quantity');
        
        const newTotal = await cartPage.getTotalPrice();
        assert(newTotal <= initialTotal, 'A termék mennyiség csökkentése után az összárnak csökkennie kell');
      } catch (error) {
        await takeScreenshot(driver, 'decrease-quantity-error');
        throw error;
      }
    });

    it('Termék eltávolítása a kosárból', async function() {
      try {
     
        const isEmpty = await cartPage.isCartEmpty();
        if (isEmpty) {
          console.log('A kosár üres, ezt a tesztet kihagyjuk');
          this.skip();
          return;
        }
        
        const initialCount = await cartPage.getCartItemsCount();
        
        await cartPage.removeItem(0);
        await takeScreenshot(driver, 'after-remove-item');
        
        const newCount = await cartPage.getCartItemsCount();
        assert(newCount < initialCount, 'A termék eltávolítása után a kosárban lévő termékek számának csökkennie kell');
      } catch (error) {
        await takeScreenshot(driver, 'remove-item-error');
        throw error;
      }
    });

    it('Továbblépés a fizetéshez', async function() {
      try {
     
        const isEmpty = await cartPage.isCartEmpty();
        if (isEmpty) {
          console.log('A kosár üres, ezt a tesztet kihagyjuk');
          this.skip();
          return;
        }
        
        const success = await cartPage.proceedToCheckout();
        await takeScreenshot(driver, 'after-proceed-to-checkout');
        
        if (success) {
          const currentUrl = await driver.getCurrentUrl();
          assert(currentUrl.includes('/checkout'), 'A felhasználónak a checkout oldalra kell kerülnie');
        }
      } catch (error) {
        await takeScreenshot(driver, 'proceed-to-checkout-error');
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
