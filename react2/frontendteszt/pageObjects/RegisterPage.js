const { By, until } = require('selenium-webdriver');
const { waitAndClick, waitAndType } = require('../helpers/testHelper');

class RegisterPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'http://localhost:3000/signup';
    this.nameField = By.name('name');
    this.emailField = By.name('email');
    this.passwordField = By.name('password');
    this.confirmPasswordField = By.name('confirmPassword');
    this.registerButton = By.xpath("//button[contains(text(), 'Regisztráció')]");
    this.successDialog = By.css('.MuiDialog-paper');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.nameField), 10000);
    return this;
  }

  async register(name, email, password, confirmPassword) {
    await waitAndType(this.driver, this.nameField, name);
    await waitAndType(this.driver, this.emailField, email);
    await waitAndType(this.driver, this.passwordField, password);
    await waitAndType(this.driver, this.confirmPasswordField, confirmPassword || password);
    await waitAndClick(this.driver, this.registerButton);
    return this;
  }

  async isRegistrationSuccessful() {
    try {
     
      await this.driver.sleep(2000);
      
      
      const possibleSuccessSelectors = [
        '.MuiDialog-paper',
        '.success-message',
        '.MuiAlert-message',
        '[role="dialog"]',
       
      ];
      
      for (const selector of possibleSuccessSelectors) {
        try {
          await this.driver.wait(until.elementLocated(By.css(selector)), 2000);
          const element = await this.driver.findElement(By.css(selector));
          const text = await element.getText();
          console.log('Found text in success element:', text);
          if (text && (text.includes('Sikeres') || text.includes('sikeres') || text.includes('success'))) {
            return true;
          }
        } catch (e) {
          
        }
      }
      
      
      try {
        await this.driver.wait(until.urlContains('/kezdolap'), 5000);
        return true;
      } catch (e) {
        
      }
      
      
      const { takeScreenshot } = require('../helpers/testHelper');
      await takeScreenshot(this.driver, 'registration-success-not-found');
      
      return false;
    } catch (error) {
      console.error('Error checking registration success:', error);
      return false;
    }
  }
}

module.exports = RegisterPage;
