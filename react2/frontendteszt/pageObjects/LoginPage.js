const { By, until } = require('selenium-webdriver');
const { waitAndClick, waitAndType } = require('../helpers/testHelper');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'http://localhost:3000/sign';
    this.emailField = By.name('email');
    this.passwordField = By.name('password');
    this.loginButton = By.xpath("//button[contains(text(), 'Bejelentkezés')]");
    this.errorAlert = By.css('.MuiCardContent-root');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.emailField), 10000);
    return this;
  }

  async login(email, password) {
    await waitAndType(this.driver, this.emailField, email);
    await waitAndType(this.driver, this.passwordField, password);
    await waitAndClick(this.driver, this.loginButton);
    return this;
  }

  async getErrorMessage() {
    try {
   
      const errorSelectors = [
        By.css('[data-testid="login-error-alert"]'),
        By.css('[data-testid="login-error-message"]'),
        By.css('[data-testid="login-error-title"]')
      ];
      
      for (const selector of errorSelectors) {
        try {
          await this.driver.wait(until.elementLocated(selector), 3000);
          const element = await this.driver.findElement(selector);
          const text = await element.getText();
          console.log('Found error message with data-testid:', text);
          return text;
        } catch (e) {
     
        }
      }
      
   
      const possibleErrorSelectors = [
        '.MuiCardContent-root',
        '.error-message',
        '.MuiAlert-message',
        '[role="alert"]'
      ];
      
      for (const selector of possibleErrorSelectors) {
        try {
          await this.driver.wait(until.elementLocated(By.css(selector)), 2000);
          const element = await this.driver.findElement(By.css(selector));
          const text = await element.getText();
          console.log('Found potential error message:', text);
          if (text && (text.includes('hiba') || text.includes('Hiba') || text.includes('error'))) {
            return text;
          }
        } catch (e) {
         
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting error message:', error);
      return null;
    }
  }
}

module.exports = LoginPage;
