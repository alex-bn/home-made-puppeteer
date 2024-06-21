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

describe("uiTestingPlayground - Test scenarios", () => {
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
      const signUpText = await pageHelper.getTextContent(page, ".signup-form > h2");
      assert.equal(signUpText, "New User Signup!");
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
      const signUpBtnSelector = 'button[data-qa="signup-button"]';
      await pageHelper.clickAndWaitForNavigation(page, signUpBtnSelector);
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
      const selector = "ul > li:nth-child(10) > a";
      const text = await pageHelper.getTextContent(page, selector);
      assert.equal(text, `Logged in as ${email.split("@")[0]}`);
    });

    it("should click 'Delete Account' button", async () => {
      const selector = 'a[href="/delete_account"]';
      await pageHelper.clickAndWaitForNavigation(page, selector);
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
});
