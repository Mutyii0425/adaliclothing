const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');
const fs = require('fs');
const path = require('path');

async function createDriver() {
  const options = new chrome.Options();
  // options.addArguments('--headless'); // Headless mód, ha szükséges
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  // Ablak méretének beállítása
  await driver.manage().window().setRect({ width: 1280, height: 800 });
  
  return driver;
}

async function takeScreenshot(driver, filename) {
  try {
    // Ellenőrizzük, hogy létezik-e a screenshots mappa
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotsDir, `${filename}.png`);
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    console.log(`Screenshot saved as ${screenshotPath}`);
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

// Várakozás egy elem megjelenésére, majd kattintás rá
async function waitAndClick(driver, locator, timeout = 10000) {
  const { until, By } = require('selenium-webdriver');
  
  // Ha a locator string, akkor By.css-ként kezeljük
  if (typeof locator === 'string') {
    locator = By.css(locator);
  }
  
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await element.click();
  return element;
}

// Várakozás egy elem megjelenésére, majd szöveg beírása
async function waitAndType(driver, locator, text, timeout = 10000) {
  const { until, By } = require('selenium-webdriver');
  
  // Ha a locator string, akkor By.css-ként kezeljük
  if (typeof locator === 'string') {
    locator = By.css(locator);
  }
  
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await element.clear();
  await element.sendKeys(text);
  return element;
}

// Várakozás egy elem szövegére
async function waitForText(driver, locator, text, timeout = 10000) {
  const { until, By } = require('selenium-webdriver');
  
  // Ha a locator string, akkor By.css-ként kezeljük
  if (typeof locator === 'string') {
    locator = By.css(locator);
  }
  
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementTextIs(element, text), timeout);
  return element;
}

module.exports = {
  createDriver,
  takeScreenshot,
  waitAndClick,
  waitAndType,
  waitForText
};
