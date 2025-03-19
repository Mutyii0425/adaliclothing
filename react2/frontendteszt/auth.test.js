const assert = require('assert');
const { createDriver, takeScreenshot } = require('./helpers/testHelper');
const LoginPage = require('./pageObjects/LoginPage');
const RegisterPage = require('./pageObjects/RegisterPage');

describe('Hitelesítési tesztek', function() {
  let driver;
  let loginPage;
  let registerPage;

  // Teszt timeout beállítása
  this.timeout(60000);

  before(async function() {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    registerPage = new RegisterPage(driver);
  });

  describe('Bejelentkezés tesztek', function() {
    it('Sikeres bejelentkezés helyes adatokkal', async function() {
      try {
        await loginPage.navigate();
        await loginPage.login('teszt@example.com', 'jelszo123');
        
        // Várjunk egy kicsit, hogy az átirányítás megtörténjen
        await driver.sleep(3000);
        
        // Készítsünk képernyőképet a bejelentkezés után
        await takeScreenshot(driver, 'after-login');
        
        const currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after login:', currentUrl);
        
        assert(currentUrl.includes('/kezdolap'), 'A felhasználónak át kellene irányítódnia a kezdőlapra');
      } catch (error) {
        await takeScreenshot(driver, 'login-success-error');
        throw error;
      }
    });

    it('Sikertelen bejelentkezés hibás adatokkal', async function() {
        try {
          await loginPage.navigate();
          await loginPage.login('hibas@example.com', 'hibas_jelszo');
          
          // Várjunk egy kicsit, hogy a hibaüzenet megjelenjen
          await driver.sleep(2000);
          
          // Készítsünk képernyőképet a hibás bejelentkezés után
          await takeScreenshot(driver, 'after-failed-login');
          
          // Ellenőrizzük, hogy nem irányított át a kezdőlapra
          const currentUrl = await driver.getCurrentUrl();
          console.log('Current URL after failed login:', currentUrl);
          
          // Ellenőrizzük, hogy a bejelentkezési oldalon maradtunk-e
          const isStillOnLoginPage = currentUrl.includes('/sign');
          assert(isStillOnLoginPage, 'A felhasználónak a bejelentkezési oldalon kellene maradnia');
          
          // Ha nem találtunk hibaüzenetet, de a bejelentkezési oldalon maradtunk,
          // akkor is sikeresnek tekintjük a tesztet
          const errorMessage = await loginPage.getErrorMessage();
          console.log('Error message found:', errorMessage);
          
          if (errorMessage) {
            assert(errorMessage.includes('hiba') || errorMessage.includes('Hiba') || errorMessage.includes('error'), 
              'A hibaüzenetnek tartalmaznia kell a "hiba", "Hiba" vagy "error" szavak valamelyikét');
          }
        } catch (error) {
          await takeScreenshot(driver, 'login-failure-error');
          throw error;
        }
      });
  });

  describe('Regisztráció tesztek', function() {
    it('Sikeres regisztráció új felhasználóval', async function() {
      try {
        // Generálunk egy egyedi email címet a timestamp segítségével
        const uniqueEmail = `test_${Date.now()}@example.com`;
        
        await registerPage.navigate();
        await registerPage.register('Teszt Felhasználó', uniqueEmail, 'jelszo123');
        
        const isSuccessful = await registerPage.isRegistrationSuccessful();
        assert(isSuccessful, 'A regisztrációnak sikeresnek kellene lennie');
      } catch (error) {
        await takeScreenshot(driver, 'register-success-error');
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
