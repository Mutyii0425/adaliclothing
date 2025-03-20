const { By, until } = require('selenium-webdriver');
const { waitAndClick, waitAndType } = require('../helpers/testHelper');

class CartPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'http://localhost:3000/kosar';
    this.cartItems = By.css('.cart-item');
    this.increaseQuantityButtons = By.css('[data-testid="increase-quantity"]');
    this.decreaseQuantityButtons = By.css('[data-testid="decrease-quantity"]');
    this.removeItemButtons = By.css('[data-testid="remove-item"]');
    this.checkoutButton = By.xpath("//button[contains(text(), 'Tovább a fizetéshez')]");
    this.emptyCartMessage = By.css('.empty-cart-message');
    this.totalPrice = By.css('.total-price');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.sleep(2000); // Wait for page to load
    return this;
  }

  async getCartItemsCount() {
    try {
      const items = await this.driver.findElements(this.cartItems);
      return items.length;
    } catch (error) {
      console.error('Error getting cart items count:', error);
      return 0;
    }
  }

  async isCartEmpty() {
    try {
      await this.driver.wait(until.elementLocated(this.emptyCartMessage), 5000);
      return true;
    } catch (error) {
      return false;
    }
  }

  async increaseItemQuantity(index = 0) {
    const buttons = await this.driver.findElements(this.increaseQuantityButtons);
    if (buttons.length > index) {
      await buttons[index].click();
      await this.driver.sleep(500); // Wait for UI update
    }
    return this;
  }

  async decreaseItemQuantity(index = 0) {
    const buttons = await this.driver.findElements(this.decreaseQuantityButtons);
    if (buttons.length > index) {
      await buttons[index].click();
      await this.driver.sleep(500); // Wait for UI update
    }
    return this;
  }

  async removeItem(index = 0) {
    const buttons = await this.driver.findElements(this.removeItemButtons);
    if (buttons.length > index) {
      await buttons[index].click();
      await this.driver.sleep(1000); // Wait for UI update
    }
    return this;
  }

  async getTotalPrice() {
    try {
      const element = await this.driver.findElement(this.totalPrice);
      const text = await element.getText();
      // Extract the number from text like "Összesen: 12345 Ft"
      const match = text.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    } catch (error) {
      console.error('Error getting total price:', error);
      return 0;
    }
  }

  async proceedToCheckout() {
    try {
      await waitAndClick(this.driver, this.checkoutButton);
      await this.driver.sleep(2000); // Wait for navigation
      return true;
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      return false;
    }
  }
}

module.exports = CartPage;
