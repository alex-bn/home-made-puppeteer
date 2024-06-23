import { Browser, Page } from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import assert from "node:assert";
import { describe, it, before, after } from "node:test";
import UserAgent from "user-agents";
import settings from "./_settings.json";
import BrowserFunctions from "../test-clients/automation-exercise/BrowserFunctions";
import Helpers from "../test-clients/automation-exercise/Helpers";
import puppeteer from "puppeteer-extra";
import Adblocker from "puppeteer-extra-plugin-adblocker";

describe("automationExercise - Test cases", () => {
  const URL = settings.testUrls.automationExercise.webAppUrl;
  let browserFunctions: BrowserFunctions;
  let pageHelper: UtilityClass;
  let userAgent: UserAgent;
  let helpers: Helpers;
  let browser: Browser;
  let page: Page;

  before(async () => {
    pageHelper = new UtilityClass();
    browserFunctions = new BrowserFunctions();
    userAgent = new UserAgent();
    helpers = new Helpers();
    puppeteer.use(Adblocker({ blockTrackers: true }));
    browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  describe("Test Case 1: Register User", () => {
    let email: string;

    it("should verify that home page is visible", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "signup/login");
    });

    it("should verify 'New User Signup!' is visible", async () => {
      await browserFunctions.verifyNewUserSignupText(page);
    });

    it("should enter name & email address", async () => {
      // #4 enter data
      email = helpers.getEmail();
      const nameSelector = 'input[data-qa="signup-name"]';
      const emailSelector = 'input[data-qa="signup-email"]';
      const name = email.split("@")[0];

      await pageHelper.typeText(page, nameSelector, name);
      await pageHelper.typeText(page, emailSelector, email);
    });

    it("should click 'Signup' button", async () => {
      await browserFunctions.clickSignUp(page);
    });

    it("should verify that 'ENTER ACCOUNT INFORMATION' is visible", async () => {
      const sel = "h2 > b";
      const text = await pageHelper.getTextContent(page, sel);
      if (text) {
        assert.equal(text.toUpperCase(), "ENTER ACCOUNT INFORMATION");
      } else {
        assert.fail("Test failed!");
      }
    });

    it("should fill details: Title, Name, Email, Password, Date of birth", async () => {
      // title
      await browserFunctions.selectTitle(page, "Mr");

      // name - already filled
      const name = await pageHelper.getInputValue(page, "#name");
      assert.equal(name, email.split("@")[0]);

      // email - readonly
      const emailReadonly = await pageHelper.getInputValue(page, "#email");
      assert.equal(emailReadonly, email);

      // password
      await pageHelper.typeText(page, "#password", "1234");

      // date of birth
      await browserFunctions.selectDateOfBirth(page);
    });

    it("should select checkbox 'Sign up for our newsletter!'", async () => {
      const sel = "#newsletter";
      await pageHelper.waitAndClick(page, sel);
    });

    it("should select checkbox 'Receive special offers from our partners!'", async () => {
      const sel = "#optin";
      await pageHelper.waitAndClick(page, sel);
    });

    it("should fill details: First name, Last name, Company, Address, Address2, Country, State, City, Zipcode, Mobile Number", async () => {
      await browserFunctions.fillAddressInformation(page);
    });

    it("should click 'Create Account button'", async () => {
      const selector = 'button[data-qa="create-account"]';
      await pageHelper.clickAndWaitForNavigation(page, selector);
    });

    it("should verify that 'ACCOUNT CREATED!' is visible", async () => {
      const text = await pageHelper.getTextContent(page, ' h2[data-qa="account-created"] > b');
      assert.equal(text?.toUpperCase(), "ACCOUNT CREATED!");
    });

    it("should click 'Continue' button", async () => {
      const selector = 'a[data-qa="continue-button"]';
      await pageHelper.clickAndWaitForNavigation(page, selector);
    });

    it("should verify that 'Logged in as username' is visible", async () => {
      await browserFunctions.verifyLoggedInUser(page, email);
    });

    it("should click 'Delete Account' button", async () => {
      await browserFunctions.deleteAccount(page);
    });

    it("should verify that 'ACCOUNT DELETED!' is visible and click 'Continue' button", async () => {
      const selector = "h2 > b";
      const text = await pageHelper.getTextContent(page, selector);
      assert.equal(text?.toUpperCase(), "ACCOUNT DELETED!");

      const btnSelector = 'a[data-qa="continue-button"]';
      await pageHelper.waitAndClick(page, btnSelector);

      // home page test
      const elementColor = await pageHelper.getInlineStylePropertyValue(page, 'li a[href="/"]', "color");
      assert.equal(elementColor, "orange");
    });

    it("should close page", async () => {
      //
      await page.close();
    });
  });

  describe("Test Case 2: Login User with correct email and password", () => {
    let user: string;
    it("should create a test user", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
      user = await browserFunctions.quickEnroll(page);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "signup/login");
    });

    it("should verify 'Login to your account' is visible", async () => {
      await browserFunctions.verifyLoginToYourAccountText(page);
    });

    it("should enter correct email address and password", async () => {
      const emailSelector = 'input[data-qa="login-email"]';
      const passwdSelector = 'input[data-qa="login-password"]';

      await page.type(emailSelector, user);
      await page.type(passwdSelector, "1234");
    });

    it("should click 'login' button", async () => {
      const loginBtn = 'button[data-qa="login-button"]';
      await Promise.all([page.waitForNavigation(), page.click(loginBtn)]);
    });

    it("should verify that 'Logged in as username' is visible", async () => {
      await browserFunctions.verifyLoggedInUser(page, user);
    });

    it("should click 'Delete Account' button", async () => {
      await browserFunctions.deleteAccount(page);
    });

    it("should verify that 'ACCOUNT DELETED!' is visible", async () => {
      const selector = "h2 > b";
      const text = await pageHelper.getTextContent(page, selector);
      assert.equal(text?.toUpperCase(), "ACCOUNT DELETED!");
    });

    it("should close page", async () => {
      //
      await page.close();
    });
  });

  describe("Test Case 3: Login User with incorrect email and password", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "signup/login");
    });

    it("should verify 'Login to your account' is visible", async () => {
      await browserFunctions.verifyLoginToYourAccountText(page);
    });

    it("should enter incorrect email address and password", async () => {
      const emailSelector = 'input[data-qa="login-email"]';
      const passwdSelector = 'input[data-qa="login-password"]';

      await page.type(emailSelector, "someRandomText1234@email.com");
      await page.type(passwdSelector, "1234");
    });

    it("should click 'login' button", async () => {
      const loginBtn = 'button[data-qa="login-button"]';
      await pageHelper.clickAndWaitForNetworkIdle(page, loginBtn);
    });

    it("should verify error 'Your email or password is incorrect!' is visible", async () => {
      const errorTextSelector = "p[style]";
      const text = await pageHelper.getTextContent(page, errorTextSelector);
      assert.equal(text, "Your email or password is incorrect!");
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 4: Logout User", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "signup/login");
    });

    it("should verify 'Login to your account' is visible", async () => {
      await browserFunctions.verifyLoginToYourAccountText(page);
    });

    it("should enter correct email address and password, and login", async () => {
      await browserFunctions.autoLogin(
        page,
        settings.testUrls.automationExercise.email,
        settings.testUrls.automationExercise.password
      );
    });

    it("should verify that 'Logged in as username' is visible", async () => {
      await browserFunctions.verifyLoggedInUser(page, settings.testUrls.automationExercise.email);
    });

    it("should click 'Logout' button", async () => {
      const logoutSelector = 'a[href="/logout"]';
      await pageHelper.clickAndWaitForNavigation(page, logoutSelector);
    });

    it("should verify that user is navigated to login page", async () => {
      const loginPageNavBarSelector = 'a[href="/login"]';
      await browserFunctions.verifyInlineColorIsOrange(page, loginPageNavBarSelector);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 5: Register User with existing email", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "signup/login");
    });

    it("should verify 'New User Signup!' is visible", async () => {
      await browserFunctions.verifyNewUserSignupText(page);
    });

    it("should enter name & email of an already registered account", async () => {
      // #4 enter data
      const alreadyRegisteredAccount = settings.testUrls.automationExercise.email;
      const nameSelector = 'input[data-qa="signup-name"]';
      const emailSelector = 'input[data-qa="signup-email"]';
      const name = alreadyRegisteredAccount.split("@")[0];

      await pageHelper.typeText(page, nameSelector, name);
      await pageHelper.typeText(page, emailSelector, alreadyRegisteredAccount);
    });

    it("should click 'Signup' button", async () => {
      await browserFunctions.clickSignUp(page);
    });

    it("should verify error 'Email Address already exist!' is visible", async () => {
      const errSelector = "p[style]";
      const text = await pageHelper.getTextContent(page, errSelector);
      assert.equal(text, "Email Address already exist!");
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 6: Contact Us Form", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Contact Us' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "contact_us");
    });

    it("should verify 'GET IN TOUCH' is visible", async () => {
      const textSelector = "div.col-sm-8 > div > h2";
      const text = await pageHelper.getTextContent(page, textSelector);
      assert.equal(text?.toUpperCase(), "GET IN TOUCH");
    });

    it("should enter name, email, subject and message", async () => {
      const nameSelector = 'input[data-qa="name"]';
      const emailSelector = 'input[data-qa="email"]';
      const subjectSelector = 'input[data-qa="subject"]';
      const messageSelector = 'textarea[data-qa="message"]';

      await pageHelper.typeText(page, nameSelector, "Crispy Baker");
      await pageHelper.typeText(page, emailSelector, "cripsy.baker@yopmail.com");
      await pageHelper.typeText(page, subjectSelector, "I am Crispy Baker - fear me");
      await pageHelper.typeText(
        page,
        messageSelector,
        "Just because the cat has kittens in the oven, it don’t make ‘em biscuits."
      );
    });

    it("should upload file", async () => {
      const uploadFileSelector = 'input[name="upload_file"]';
      await pageHelper.loadFile(page, uploadFileSelector, "C:/Users/Lisi/Desktop/UtilityClass/tsconfig.json");
    });

    it("should click OK on page dialog - event listener before actual event", async () => {
      page.on("dialog", async (dialog) => {
        if (dialog.message().includes("Press OK to proceed!")) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
      });
    });

    it("should click 'Submit' button", async () => {
      const submitSelector = 'input[data-qa="submit-button"]';
      await pageHelper.waitAndClick(page, submitSelector);
    });

    it("should verify success message 'Success! Your details have been submitted successfully.' is visible", async () => {
      const successMessageSelector = "div.status.alert.alert-success";
      const text = await pageHelper.getTextContent(page, successMessageSelector);
      assert.equal(text, "Success! Your details have been submitted successfully.");
    });

    it("should click 'Home' button and verify that landed to home page successfully", async () => {
      const homeBtnSelector = "#form-section > a";
      await pageHelper.waitAndClick(page, homeBtnSelector);
      //
      const homePageOrangeSelector = 'li a[href="/"]';
      await browserFunctions.verifyInlineColorIsOrange(page, homePageOrangeSelector);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 7: Verify Test Cases Page", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Test Cases' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "test_cases");
    });

    it("should verify user is navigated to test cases page successfully", async () => {
      const textSelector = "h5 > span";
      const expectedMessageFromTestCasesPage =
        "Below is the list of test Cases for you to practice the Automation. Click on the scenario for detailed Test Steps:";
      const text = await pageHelper.getTextContent(page, textSelector);
      assert.equal(text, expectedMessageFromTestCasesPage);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 8: Verify All Products and product detail page", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);
    });

    it("should click on 'Products' button", async () => {
      await browserFunctions.accessNavbarMenu(page, "products");
    });

    it("should verify user is navigated to ALL PRODUCTS page successfully", async () => {
      const allProductsTextSelector = ".padding-right > div > h2";
      const text = await pageHelper.getTextContent(page, allProductsTextSelector);
      assert.equal(text?.toUpperCase(), "ALL PRODUCTS");
    });

    it("should verify that the products list is visible", async () => {
      const productSelector = "div.product-image-wrapper";
      const nrProducts = 34;
      const products = await page.$$(productSelector);
      assert.equal(products.length, nrProducts);
    });

    it("should click on 'View Product' of first product", async () => {
      const viewFirstProductSelector = 'a[href="/product_details/1"]';
      await pageHelper.clickAndWaitForNavigation(page, viewFirstProductSelector);
    });

    it("should verify that user is landed to product detail page", async () => {
      const url = page.url();
      assert.equal(url, "https://automationexercise.com/product_details/1");
    });

    it("should verify that detail detail is visible: product name, category, price, availability, condition, brand", async () => {
      // parent info html
      const parentSelector = "div.product-information";
      const parentElement = await page.$(parentSelector);

      // product name
      const childSelector1 = "h2";
      const childElement1 = await parentElement?.$(childSelector1);
      const textContent1 = await page.evaluate((el) => el?.textContent, childElement1);
      assert.equal(textContent1, "Blue Top");

      // availability
      const childSelector2 = "p:nth-child(6)";
      const childElement2 = await parentElement?.$(childSelector2);
      const textContent2 = await page.evaluate((el) => el?.textContent, childElement2);
      assert.equal(textContent2, "Availability: In Stock");

      // condition
      const childSelector3 = "p:nth-child(7)";
      const childElement3 = await parentElement?.$(childSelector3);
      const textContent3 = await page.evaluate((el) => el?.textContent, childElement3);
      assert.equal(textContent3, "Condition: New");

      // brand
      const childSelector4 = "p:nth-child(8)";
      const childElement4 = await parentElement?.$(childSelector4);
      const textContent4 = await page.evaluate((el) => el?.textContent, childElement4);
      assert.equal(textContent4, "Brand: Polo");

      // category
      const childSelector5 = "p:nth-child(3)";
      const childElement5 = await parentElement?.$(childSelector5);
      const textContent5 = await page.evaluate((el) => el?.textContent, childElement5);
      assert.equal(textContent5, "Category: Women > Tops");

      // price
      const childSelector6 = "span > span";
      const childElement6 = await parentElement?.$(childSelector6);
      const textContent6 = await page.evaluate((el) => el?.textContent, childElement6);
      assert.equal(textContent6, "Rs. 500");
    });

    it("should close page", async () => {
      await page.close();
    });
  });
  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
});
