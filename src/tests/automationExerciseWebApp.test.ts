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
      page = await browser.newPage();
      await page.setUserAgent(userAgent.random().toString());

      // implicit verification
      await browserFunctions.visitHomePage(page, URL);
    });

    it("should click on 'Signup / Login' button", async () => {
      const signUpSelector = 'li a[href="/login"]';
      await pageHelper.waitAndClick(page, signUpSelector);
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
      page = await browserFunctions.makePageAndGoToLogin(browser, URL, userAgent);
      user = await browserFunctions.quickEnroll(page);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.goToLogin(page, URL);
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
    it("should navigate to home page & open login form", async () => {
      page = await browserFunctions.makePageAndGoToLogin(browser, URL, userAgent);
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

  describe.only("Test Case 4: Logout User", () => {
    it("should navigate to home page & open login form", async () => {
      page = await browserFunctions.makePageAndGoToLogin(browser, URL, userAgent);
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
    it("should navigate to home page & open 'Signup / Login' form", async () => {
      page = await browserFunctions.makePageAndGoToLogin(browser, URL, userAgent);
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
});
