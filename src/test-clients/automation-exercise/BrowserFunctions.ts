import { Browser, Page } from "puppeteer";
import UtilityClass from "../../utils/UtilityClass";
import assert from "node:assert";
import Helpers from "./Helpers";
import UserAgent from "user-agents";

const pageHelper = new UtilityClass();
const helpers = new Helpers();

export default class BrowserFunctions {
  async verifyInlineColorIsOrange(page: Page, selector: string) {
    const elementColor = await pageHelper.getInlineStylePropertyValue(page, selector, "color");
    assert.equal(elementColor, "orange");
  }

  async createPageObjectAndGoToHomePage(browser: Browser, url: string, userAgent: UserAgent): Promise<Page> {
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await this.visitHomePage(page, url);
    return page;
  }

  async visitHomePage(page: Page, url: string) {
    // go to page
    await pageHelper.loadPage(page, url);

    // home page test
    const homePageSelector = 'li a[href="/"]';
    await this.verifyInlineColorIsOrange(page, homePageSelector);
  }

  async accessNavbarMenu(
    page: Page,
    link: "home" | "products" | "cart" | "signup/login" | "test_cases" | "api_testing" | "contact_us"
  ): Promise<void> {
    const selectors = {
      home: 'li a[href="/"]',
      products: 'li a[href="/products"]',
      cart: 'li a[href="/view_cart"]',
      signupLogin: 'li a[href="/login"]',
      testCases: 'li a[href="/test_cases"]',
      apiTesting: 'li a[href="/api_list"]',
      contactUs: 'li a[href="/contact_us"]',
    };

    try {
      switch (link) {
        case "home":
          await pageHelper.waitAndClick(page, selectors.home);
          await this.verifyInlineColorIsOrange(page, selectors.home);
          break;

        case "products":
          await pageHelper.waitAndClick(page, selectors.products);
          await this.verifyInlineColorIsOrange(page, selectors.products);
          break;

        case "cart":
          await pageHelper.waitAndClick(page, selectors.cart);
          await this.verifyInlineColorIsOrange(page, selectors.cart);
          break;

        case "signup/login":
          await pageHelper.waitAndClick(page, selectors.signupLogin);
          await this.verifyInlineColorIsOrange(page, selectors.signupLogin);
          break;

        case "test_cases":
          await pageHelper.waitAndClick(page, selectors.testCases);
          await this.verifyInlineColorIsOrange(page, selectors.testCases);
          break;

        case "api_testing":
          await pageHelper.waitAndClick(page, selectors.apiTesting);
          await this.verifyInlineColorIsOrange(page, selectors.apiTesting);
          break;

        case "contact_us":
          await pageHelper.waitAndClick(page, selectors.contactUs);
          await this.verifyInlineColorIsOrange(page, selectors.contactUs);
          break;

        default:
          console.warn(`Unknown link: ${link}, defaulting to home`);
          await pageHelper.waitAndClick(page, selectors.home);
          await this.verifyInlineColorIsOrange(page, selectors.home);
          break;
      }
    } catch (error) {
      console.error(`Failed to access ${link} menu:`, error);
      // throw error;
    }
  }

  async verifyLoginToYourAccountText(page: Page) {
    const loginFormTextSelector = ".login-form > h2";
    const text = await pageHelper.getTextContent(page, loginFormTextSelector);
    assert.equal(text, "Login to your account");
  }

  async verifyNewUserSignupText(page: Page) {
    const signUpText = await pageHelper.getTextContent(page, ".signup-form > h2");
    assert.equal(signUpText, "New User Signup!");
  }

  async autoLogin(page: Page, email: string, passwd: string): Promise<void> {
    const emailSelector = 'input[data-qa="login-email"]';
    const passwdSelector = 'input[data-qa="login-password"]';
    const loginBtn = 'button[data-qa="login-button"]';

    try {
      await Promise.all([
        page.waitForSelector(emailSelector, { timeout: 5000 }),
        page.waitForSelector(passwdSelector, { timeout: 5000 }),
        page.waitForSelector(loginBtn, { timeout: 5000 }),
      ]);

      await page.type(emailSelector, email);
      await page.type(passwdSelector, passwd);

      await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }), page.click(loginBtn)]);
    } catch (error) {
      console.error("Login failed:", error);
      // Optionally, you could rethrow the error or handle it according to your needs
      // throw error;
    }
  }

  async verifyLoggedInUser(page: Page, userEmail: string) {
    const selector = "ul > li:nth-child(10) > a";
    const text = await pageHelper.getTextContent(page, selector);
    assert.equal(text, `Logged in as ${userEmail.split("@")[0]}`);
  }

  async deleteAccount(page: Page) {
    const selector = 'a[href="/delete_account"]';
    await pageHelper.clickAndWaitForNavigation(page, selector);
  }

  async clickSignUp(page: Page) {
    const signUpBtnSelector = 'button[data-qa="signup-button"]';
    await pageHelper.clickAndWaitForNavigation(page, signUpBtnSelector);
  }

  async selectTitle(page: Page, title: "Mr" | "Mrs") {
    const selector = `input[value="${title}"]`;
    await pageHelper.waitAndClick(page, selector);
  }

  async selectDateOfBirth(page: Page) {
    const days = "#days";
    const month = "#months";
    const year = "#years";

    const daysEl = await page.$(days);
    const monthEl = await page.$(month);
    const yearEl = await page.$(year);

    await daysEl?.select("25");
    await monthEl?.select("5");
    await yearEl?.select("1984");
  }

  async fillAddressInformation(page: Page) {
    const firstName = "#first_name";
    const lastName = "#last_name";
    const company = "#company";
    const address = "#address1";
    const address2 = "#address2";
    const country = "#country";
    const state = "#state";
    const city = "#city";
    const zipCode = "#zipcode";
    const nr = "#mobile_number";

    await pageHelper.typeText(page, firstName, "string");
    await pageHelper.typeText(page, lastName, "string");
    await pageHelper.typeText(page, company, "string");
    await pageHelper.typeText(page, address, "Address * (Street address, P.O. Box, Company name, etc.)");
    await pageHelper.typeText(page, address2, "Address * (Street address, P.O. Box, Company name, etc.)");
    await page.select(country, "Israel");
    await pageHelper.typeText(page, state, "string");
    await pageHelper.typeText(page, city, "string");
    await pageHelper.typeText(page, zipCode, "string");
    await pageHelper.typeText(page, nr, "string");
  }

  async quickEnroll(page: Page): Promise<string> {
    //
    const signUpSelector = 'li a[href="/login"]';
    await pageHelper.waitAndClick(page, signUpSelector);
    //
    const email = helpers.getEmail();
    const nameSelector = 'input[data-qa="signup-name"]';
    const emailSelector = 'input[data-qa="signup-email"]';
    const name = email.split("@")[0];
    //
    await pageHelper.typeText(page, nameSelector, name);
    await pageHelper.typeText(page, emailSelector, email);

    //
    await this.clickSignUp(page);

    //
    await this.selectTitle(page, "Mr");
    await pageHelper.typeText(page, "#password", "1234");
    await this.selectDateOfBirth(page);

    //
    await this.fillAddressInformation(page);

    //
    const selector = 'button[data-qa="create-account"]';
    await pageHelper.clickAndWaitForNavigation(page, selector);

    //
    const selectorContinue = 'a[data-qa="continue-button"]';
    await pageHelper.clickAndWaitForNavigation(page, selectorContinue);

    //
    const selectorLoginText = "ul > li:nth-child(10) > a";
    const text = await pageHelper.getTextContent(page, selectorLoginText);
    assert.equal(text, `Logged in as ${email.split("@")[0]}`);

    //

    const logoutSel = 'a[href="/logout"]';
    await pageHelper.clickAndWaitForNavigation(page, logoutSel);

    //
    return email;
  }
}
