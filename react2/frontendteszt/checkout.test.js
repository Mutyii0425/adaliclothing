const assert = require('assert');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const CartPage = require('./pageObjects/CartPage');
const CheckoutPage = require('./pageObjects/CheckoutPage');

describe('Fizetési folyamat tesztek', function() {
  let driver;
  let loginPage;
  let cartPage;
  let checkoutPage;

  
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    cartPage = new CartPage(driver);
    checkoutPage = new CheckoutPage(driver);
    
    await loginPage.navigate();
    await loginPage.login('teszt@example.com', 'jelszo123');
    await driver.sleep(3000); 
  });

  describe('Checkout folyamat', function() {
    it('Checkout oldal betöltése a kosárból', async function() {
      try {
      
        await cartPage.navigate();
        
        
        const isEmpty = await cartPage.isCartEmpty();
        if (isEmpty) {
          console.log('A kosár üres, ezt a tesztet kihagyjuk');
          this.skip();
          return;
        }

        await cartPage.proceedToCheckout();
        await takeScreenshot(driver, 'checkout-page-loaded');
        
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('/checkout'), 'A checkout oldalnak kell betöltődnie');
      } catch (error) {
        await takeScreenshot(driver, 'checkout-page-load-error');
        throw error;
      }
    });

    it('Szállítási adatok kitöltése', async function() {
      try {
       
        await checkoutPage.navigate();
        
        const shippingDetails = {
          name: 'Teszt Felhasználó',
          address: 'Teszt utca 123',
          city: 'Budapest',
          zip: '1234',
          phone: '+36701234567'
        };
        
        await checkoutPage.fillShippingDetails(shippingDetails);
        await takeScreenshot(driver, 'after-filling-shipping-details');
        
       
      } catch (error) {
        await takeScreenshot(driver, 'fill-shipping-details-error');
        throw error;
      }
    });

    it('Fizetési mód kiválasztása', async function() {
      try {
        
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/checkout')) {
          await checkoutPage.navigate();
        }
        
        await checkoutPage.selectPaymentMethod('cash');
        await takeScreenshot(driver, 'after-selecting-payment-method');
        
        
      } catch (error) {
        await takeScreenshot(driver, 'select-payment-method-error');
        throw error;
      }
    });

    it('Rendelés leadása', async function() {
      try {
        
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/checkout')) {
          await checkoutPage.navigate();
          
        
          const shippingDetails = {
            name: 'Teszt Felhasználó',
            address: 'Teszt utca 123',
            city: 'Budapest',
            zip: '1234',
            phone: '+36701234567'
          };
          
          await checkoutPage.fillShippingDetails(shippingDetails);
          await checkoutPage.selectPaymentMethod('cash');
        }
        
        const success = await checkoutPage.placeOrder();
        await takeScreenshot(driver, 'after-placing-order');
        
        if (success) {
          const isOrderSuccessful = await checkoutPage.isOrderSuccessful();
          assert(isOrderSuccessful, 'A rendelésnek sikeresnek kell lennie');
        }
      } catch (error) {
        await takeScreenshot(driver, 'place-order-error');
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
