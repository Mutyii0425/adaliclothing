const { By, until } = require('selenium-webdriver');
const { waitAndClick, waitAndType } = require('../helpers/testHelper');

class ProductPage {
  constructor(driver) {
    this.driver = driver;
    
   
    this.productTitle = By.css('h5.MuiTypography-root');
    this.productPrice = By.css('h6.MuiTypography-root');
    this.productDescription = By.css('p.MuiTypography-body1');
    this.productImage = By.css('img[alt]');
    
   
    this.sizeSelect = By.css('div[role="button"]');
    this.addToCartButton = By.xpath("//button[contains(text(), 'Kosárba')]");
    this.sizeError = By.css('p.MuiFormHelperText-root');
   
    this.cartSuccessAlert = By.css('div[role="alert"]');
    this.continueShoppingButton = By.xpath("//button[contains(text(), 'Vásárlás folytatása')]");
    this.checkoutButton = By.xpath("//button[contains(text(), 'Rendelés leadása')]");
    
  
    this.menuButton = By.css('button:first-child');
    this.darkModeSwitch = By.css('input[type="checkbox"]');
    this.cartIcon = By.css('svg[data-testid="ShoppingCartIcon"]');
    this.profileButton = By.xpath("//button[contains(text(), 'Profil')]");
    
  
    this.loginAlert = By.css('div[role="alert"]');
  }

  async getProductTitle() {
    const element = await this.driver.wait(until.elementLocated(this.productTitle), 10000);
    return element.getText();
  }

  async getProductPrice() {
    const element = await this.driver.findElement(this.productPrice);
    return element.getText();
  }

  async getProductDescription() {
    const element = await this.driver.findElement(this.productDescription);
    return element.getText();
  }

  async selectSize(size) {
    try {
    
      const sizeDropdown = await this.driver.findElement(this.sizeSelect);
      await sizeDropdown.click();
      
      
      await this.driver.sleep(1000);
      
     
      const sizeOption = await this.driver.findElement(
        By.xpath(`//li[contains(text(), '${size}')]`)
      );
      await sizeOption.click();
      
   
      await this.driver.sleep(500);
    } catch (error) {
      console.error('Hiba a méret kiválasztása során:', error);
    }
    return this;
  }

  async addToCart() {
    await waitAndClick(this.driver, this.addToCartButton);
    await this.driver.sleep(1000);
    return this;
  }

  async getSizeError() {
    try {
      const element = await this.driver.findElement(this.sizeError);
      return element.getText();
    } catch (error) {
      return null;
    }
  }

  async isCartSuccessAlertDisplayed() {
    try {
      await this.driver.wait(until.elementLocated(this.cartSuccessAlert), 5000);
      return true;
    } catch (error) {
      return false;
    }
  }

  async continueShopping() {
    await waitAndClick(this.driver, this.continueShoppingButton);
    return this;
  }

  async proceedToCheckout() {
    await waitAndClick(this.driver, this.checkoutButton);
    return this;
  }

  async toggleDarkMode() {
    await waitAndClick(this.driver, this.darkModeSwitch);
    await this.driver.sleep(500); 
    return this;
  }

  async openSideMenu() {
    await waitAndClick(this.driver, this.menuButton);
    await this.driver.sleep(500); 
    return this;
  }

  async closeSideMenu() {
    await waitAndClick(this.driver, this.menuButton);
    await this.driver.sleep(500); 
    return this;
  }

  async goToCart() {
    await waitAndClick(this.driver, this.cartIcon);
    await this.driver.sleep(1000); 
    return this;
  }

  async openProfileMenu() {
    await waitAndClick(this.driver, this.profileButton);
    await this.driver.sleep(500); 
    return this;
  }

  async isLoginAlertDisplayed() {
    try {
      await this.driver.wait(until.elementLocated(this.loginAlert), 5000);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ProductPage;