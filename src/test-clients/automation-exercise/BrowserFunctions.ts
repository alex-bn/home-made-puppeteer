import { Browser, ElementHandle, Page } from "puppeteer";
import UtilityClass from "../../utils/UtilityClass";
import assert from "node:assert";
import Helpers from "./Helpers";
import UserAgent from "user-agents";
import settings from "../../tests/_settings.json";

const pageHelper = new UtilityClass();
const helpers = new Helpers();

export default class BrowserFunctions {
  private url: string;
  private _homePage?: HomePage;
  private _products?: Products;
  private _loginSignUp?: LoginSignUp;

  constructor(url: string) {
    this.url = url;
  }

  get homePage(): HomePage {
    if (!this._homePage) {
      this._homePage = new HomePage(this.url);
    }
    return this._homePage;
  }

  get products(): Products {
    if (!this._products) {
      this._products = new Products();
    }
    return this._products;
  }

  get loginSignUp(): LoginSignUp {
    if (!this._loginSignUp) {
      this._loginSignUp = new LoginSignUp();
    }
    return this._loginSignUp;
  }
}

class HomePage {
  private url: string = "";
  constructor(url: string) {
    this.url = url;
  }
  async goToHomePage(browser: Browser, userAgent: UserAgent): Promise<Page> {
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await this.visitHomePage(page);
    return page;
  }

  async visitHomePage(page: Page) {
    // go to page
    await pageHelper.loadPage(page, this.url);

    // home page test
    const homePageSelector = 'li a[href="/"]';
    await this.headerVerifyOrangeInlineColor(page, homePageSelector);
  }

  async headerVerifyOrangeInlineColor(page: Page, selector: string) {
    const elementColor = await pageHelper.getInlineStylePropertyValue(page, selector, "color");
    assert.equal(elementColor, "orange");
  }

  async headerAccessNavbarMenu(
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

    switch (link) {
      case "home":
        await pageHelper.waitAndClick(page, selectors.home);
        await this.headerVerifyOrangeInlineColor(page, selectors.home);
        break;

      case "products":
        await pageHelper.waitAndClick(page, selectors.products);
        await this.headerVerifyOrangeInlineColor(page, selectors.products);
        break;

      case "cart":
        await pageHelper.waitAndClick(page, selectors.cart);
        await this.headerVerifyOrangeInlineColor(page, selectors.cart);
        break;

      case "signup/login":
        await pageHelper.waitAndClick(page, selectors.signupLogin);
        await this.headerVerifyOrangeInlineColor(page, selectors.signupLogin);
        break;

      case "test_cases":
        await pageHelper.waitAndClick(page, selectors.testCases);
        await this.headerVerifyOrangeInlineColor(page, selectors.testCases);
        break;

      case "api_testing":
        await pageHelper.waitAndClick(page, selectors.apiTesting);
        await this.headerVerifyOrangeInlineColor(page, selectors.apiTesting);
        break;

      case "contact_us":
        await pageHelper.waitAndClick(page, selectors.contactUs);
        await this.headerVerifyOrangeInlineColor(page, selectors.contactUs);
        break;

      default:
        console.warn(`Unknown link: ${link}, defaulting to home`);
        await pageHelper.waitAndClick(page, selectors.home);
        await this.headerVerifyOrangeInlineColor(page, selectors.home);
        break;
    }
  }

  async headerVerifyLoggedUser(page: Page, userEmail: string) {
    const selector = "ul > li:nth-child(10) > a";
    const text = await pageHelper.getTextContent(page, selector);
    assert.equal(text, `Logged in as ${userEmail.split("@")[0]}`);
  }

  async headerDeleteAccount(page: Page) {
    const selector = 'a[href="/delete_account"]';
    await pageHelper.clickAndWaitForNavigation(page, selector);
  }

  async footerVerifySubscriptionText(page: Page) {
    const sel = ".single-widget h2";
    const text = await pageHelper.getTextContent(page, sel);
    assert.equal(text?.toUpperCase(), "SUBSCRIPTION");
  }

  async footerVerifySubscriptionMessage(page: Page) {
    const sel = "#success-subscribe > div";
    const text = await pageHelper.getTextContent(page, sel);
    const isVisible = await pageHelper.elementIsVisible(page, sel); // should be visible
    if (text && isVisible) {
      assert.equal(text, "You have been successfully subscribed!");
      assert.equal(isVisible, true);
    } else {
      assert.fail("Test failed!");
    }
  }

  async footerSubscribeEmail(page: Page, email: string) {
    // click
    await page.type("#susbscribe_email", email);
    await page.click("#subscribe");
  }
}

class Products {
  async verifyAllProductsPageText(page: Page) {
    const allProductsTextSelector = ".padding-right > div > h2";
    const text = await pageHelper.getTextContent(page, allProductsTextSelector);
    assert.equal(text?.toUpperCase(), "ALL PRODUCTS");
  }

  async addProduct(page: Page, productNumber: number): Promise<void> {
    const addToCartBtnSelector = `.productinfo a[data-product-id="${productNumber}"]`;
    const firstProductSelector = `div.features_items > div:nth-child(${productNumber + 2})`; // Adjust the selector as per the structure

    const elHandle = await page.waitForSelector(firstProductSelector);

    if (elHandle) {
      await elHandle.hover();
      await pageHelper.waitAndClick(page, addToCartBtnSelector);
    } else {
      throw new Error(`Product with number ${productNumber} not found.`);
    }
  }

  async continueShopping(page: Page) {
    const continueBtnSelector = "div.modal-footer > button";
    const continueBtnHandle = await pageHelper.waitForElement(page, continueBtnSelector, 10000);
    await continueBtnHandle?.click();
  }

  async cartGetProductDetails(page: Page, productId: string) {
    const productSelector = `tr[id="product-${productId}"]`;

    const productDetails = await page.$eval(productSelector, (el) => {
      const price = el.querySelector(".cart_price > p")?.textContent?.trim().split(" ")[1];
      const quantity = el.querySelector(".cart_quantity > button")?.textContent?.trim();
      const totalPrice = el.querySelector(".cart_total > p")?.textContent?.trim().split(" ")[1];

      return { price, quantity, totalPrice };
    });

    return productDetails;
  }

  async cartClickCheckout(page: Page) {
    await page.click("a.check_out");
  }

  async cartGetProductDetailsFromHandle(productHandle: ElementHandle<Element>) {
    const productDetails = await productHandle.evaluate((el) => {
      const price = el.querySelector(".cart_price > p")?.textContent?.trim().split(" ")[1];
      const quantity = el.querySelector(".cart_quantity > button")?.textContent?.trim();
      const totalPrice = el.querySelector(".cart_total > p")?.textContent?.trim().split(" ")[1];
      return { price, quantity, totalPrice };
    });
    return productDetails;
  }
}

class LoginSignUp {
  async quickEnroll(page: Page, logout: true | false): Promise<string> {
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
    await this.clickLoginOrSignupButton(page, "signup");

    //
    await this.selectTitle(page, "Mr");
    await pageHelper.typeText(page, "#password", "1234");
    await this.selectDateOfBirth(page, "25", "8", "1984");

    //
    await this.fillAddressInformation(page);

    //
    const selector = 'button[data-qa="create-account"]';
    await pageHelper.clickAndWaitForNavigation(page, selector);

    // If logout is false, return after creating the account
    if (!logout) {
      return email;
    }

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

  async autoLogin(page: Page, email: string, passwd: string): Promise<void> {
    const emailSelector = 'input[data-qa="login-email"]';
    const passwdSelector = 'input[data-qa="login-password"]';
    const loginBtn = 'button[data-qa="login-button"]';

    await Promise.all([
      page.waitForSelector(emailSelector, { timeout: 5000 }),
      page.waitForSelector(passwdSelector, { timeout: 5000 }),
      page.waitForSelector(loginBtn, { timeout: 5000 }),
    ]);

    await page.type(emailSelector, email);
    await page.type(passwdSelector, passwd);

    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }), page.click(loginBtn)]);
  }

  async clickLoginOrSignupButton(page: Page, button: "signup" | "login") {
    const btnSelector = `button[data-qa="${button}-button"]`;
    await pageHelper.clickAndWaitForNavigation(page, btnSelector);
  }

  async selectTitle(page: Page, title: "Mr" | "Mrs") {
    const selector = `input[value="${title}"]`;
    await pageHelper.waitAndClick(page, selector);
  }

  async selectDateOfBirth(page: Page, day: string, month: string, year: string) {
    const daysSelector = "#days";
    const monthsSelector = "#months";
    const yearsSelector = "#years";

    const daysEl = await page.$(daysSelector);
    const monthsEl = await page.$(monthsSelector);
    const yearsEl = await page.$(yearsSelector);

    if (daysEl && monthsEl && yearsEl) {
      await daysEl.select(day);
      await monthsEl.select(month);
      await yearsEl.select(year);
    }
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

    await pageHelper.typeText(page, firstName, settings.testUrls.automationExercise.enrollInfo.firstName);
    await pageHelper.typeText(page, lastName, settings.testUrls.automationExercise.enrollInfo.lastName);
    await pageHelper.typeText(page, company, settings.testUrls.automationExercise.enrollInfo.company);
    await pageHelper.typeText(page, address, settings.testUrls.automationExercise.enrollInfo.address1);
    await pageHelper.typeText(page, address2, settings.testUrls.automationExercise.enrollInfo.address2);
    await page.select(country, settings.testUrls.automationExercise.enrollInfo.state);
    await pageHelper.typeText(page, state, settings.testUrls.automationExercise.enrollInfo.state);
    await pageHelper.typeText(page, city, settings.testUrls.automationExercise.enrollInfo.city);
    await pageHelper.typeText(page, zipCode, settings.testUrls.automationExercise.enrollInfo.zipp);
    await pageHelper.typeText(page, nr, settings.testUrls.automationExercise.enrollInfo.phone);
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

  async verifyAccountCreatedText(page: Page) {
    const text = await pageHelper.getTextContent(page, ' h2[data-qa="account-created"] > b');
    assert.equal(text?.toUpperCase(), "ACCOUNT CREATED!");
  }
}
