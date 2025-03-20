const { By, until } = require('selenium-webdriver');
const { waitAndClick, waitAndType } = require('../helpers/testHelper');

class CheckoutPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'http://localhost:3000/checkout';
    this.nameField = By.name('name');
    this.emailField = By.name('email');
    this.addressField = By.name('address');
    this.cityField = By.name('city');
    this.zipField = By.name('zip');
    this.phoneField = By.name('phone');
    this.paymentMethodRadios = By.css('input[name="paymentMethod"]');
    this.placeOrderButton = By.xpath("//button[contains(text(), 'Rendelés leadása')]");
    this.orderSummary = By.css('.order-summary');
    this.successMessage = By.css('.success-message');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.sleep(2000); // Wait for page to load
    return this;
  }

  async fillShippingDetails(details) {
    if (details.name) await waitAndType(this.driver, this.nameField, details.name);
    if (details.email) await waitAndType(this.driver, this.emailField, details.email);
    if (details.address) await waitAndType(this.driver, this.addressField, details.address);
    if (details.city) await waitAndType(this.driver, this.cityField, details.city);
    if (details.zip) await waitAndType(this.driver, this.zipField, details.zip);
    if (details.phone) await waitAndType(this.driver, this.phoneField, details.phone);
    return this;
  }

  async selectPaymentMethod(method) {
    try {
      const paymentMethods = await this.driver.findElements(this.paymentMethodRadios);
      
      // Find the right payment method radio button
      for (const radio of paymentMethods) {
        const value = await radio.getAttribute('value');
        if (value === method) {
          await radio.click();
          break;
        }
      }
      
      return this;
    } catch (error) {
      console.error('Error selecting payment method:', error);
      return this;
    }
  }

  async placeOrder() {
    try {
      await waitAndClick(this.driver, this.placeOrderButton);
      await this.driver.sleep(3000); // Wait for order processing
      return true;
    } catch (error) {
      console.error('Error placing order:', error);
      return false;
    }
  }

  async isOrderSuccessful() {
    try {
      await this.driver.wait(until.elementLocated(this.successMessage), 10000);
      return true;
    } catch (error) {
      console.error('Order success message not found:', error);
      return false;
    }
  }

  async getOrderSummaryTotal() {
    try {
      const element = await this.driver.findElement(this.orderSummary);
      const text = await element.getText();
      // Extract the number from text like "Összesen: 12345 Ft"
      const match = text.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    } catch (error) {
      console.error('Error getting order summary total:', error);
      return 0;
    }
  }
}

module.exports = CheckoutPage;
