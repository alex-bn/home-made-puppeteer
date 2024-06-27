import { Browser, ElementHandle, Page } from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import assert, { equal } from "node:assert";
import { describe, it, before, after } from "node:test";
import UserAgent from "user-agents";
import settings from "./_settings.json";
import BrowserFunctions from "../test-clients/automation-exercise/BrowserFunctions";
import Helpers from "../test-clients/automation-exercise/Helpers";
import puppeteer from "puppeteer-extra";
import Adblocker from "puppeteer-extra-plugin-adblocker";

describe("automationExercise - Test cases", () => {
  let browserFunctions: BrowserFunctions;
  let pageHelper: UtilityClass;
  let userAgent: UserAgent;
  let helpers: Helpers;
  let browser: Browser;
  let page: Page;

  before(async () => {
    pageHelper = new UtilityClass();
    browserFunctions = new BrowserFunctions(settings.testUrls.automationExercise.webAppUrl);
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
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "signup/login");
    });

    it("should verify 'New User Signup!' is visible", async () => {
      await browserFunctions.loginSignUp.verifyNewUserSignupText(page);
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
      await browserFunctions.loginSignUp.clickLoginOrSignupButton(page, "signup");
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
      await browserFunctions.loginSignUp.selectTitle(page, "Mr");

      // name - already filled
      const name = await pageHelper.getInputValue(page, "#name");
      assert.equal(name, email.split("@")[0]);

      // email - readonly
      const emailReadonly = await pageHelper.getInputValue(page, "#email");
      assert.equal(emailReadonly, email);

      // password
      await pageHelper.typeText(page, "#password", "1234");

      // date of birth
      await browserFunctions.loginSignUp.selectDateOfBirth(page, "25", "5", "1984");
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
      await browserFunctions.loginSignUp.fillAddressInformation(page);
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
      await browserFunctions.homePage.headerVerifyLoggedUser(page, email);
    });

    it("should click 'Delete Account' button", async () => {
      await browserFunctions.homePage.headerDeleteAccount(page);
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
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
      user = await browserFunctions.loginSignUp.quickEnroll(page);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "signup/login");
    });

    it("should verify 'Login to your account' is visible", async () => {
      await browserFunctions.loginSignUp.verifyLoginToYourAccountText(page);
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
      await browserFunctions.homePage.headerVerifyLoggedUser(page, user);
    });

    it("should click 'Delete Account' button", async () => {
      await browserFunctions.homePage.headerDeleteAccount(page);
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
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "signup/login");
    });

    it("should verify 'Login to your account' is visible", async () => {
      await browserFunctions.loginSignUp.verifyLoginToYourAccountText(page);
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
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "signup/login");
    });

    it("should verify 'Login to your account' is visible", async () => {
      await browserFunctions.loginSignUp.verifyLoginToYourAccountText(page);
    });

    it("should enter correct email address and password, and login", async () => {
      await browserFunctions.loginSignUp.autoLogin(
        page,
        settings.testUrls.automationExercise.email,
        settings.testUrls.automationExercise.password
      );
    });

    it("should verify that 'Logged in as username' is visible", async () => {
      await browserFunctions.homePage.headerVerifyLoggedUser(page, settings.testUrls.automationExercise.email);
    });

    it("should click 'Logout' button", async () => {
      const logoutSelector = 'a[href="/logout"]';
      await pageHelper.clickAndWaitForNavigation(page, logoutSelector);
    });

    it("should verify that user is navigated to login page", async () => {
      const loginPageNavBarSelector = 'a[href="/login"]';
      await browserFunctions.homePage.headerVerifyOrangeInlineColor(page, loginPageNavBarSelector);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 5: Register User with existing email", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Signup / Login' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "signup/login");
    });

    it("should verify 'New User Signup!' is visible", async () => {
      await browserFunctions.loginSignUp.verifyNewUserSignupText(page);
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
      await browserFunctions.loginSignUp.clickLoginOrSignupButton(page, "signup");
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
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click OK on page dialog - event listener before actual event", async () => {
      page.on("dialog", async (dialog) => {
        if (dialog.message().includes("Press OK to proceed!")) {
          await dialog.accept();
        }
      });
    });

    it("should click on 'Contact Us' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "contact_us");
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
        "Just because the cat has kittens in the oven, it don't make 'em biscuits."
      );
    });

    it("should upload file", async () => {
      const uploadFileSelector = 'input[name="upload_file"]';
      const [fileInput] = await Promise.all([page.waitForFileChooser(), page.click(uploadFileSelector)]);
      await fileInput.accept(["./_settings.json"]);
    });

    it("should click 'Submit' button", async () => {
      const buttonSelector = 'input[data-qa="submit-button"]';
      const targetSelector = "div.status.alert.alert-success";
      await pageHelper.clickUntilSelectorAppears(page, buttonSelector, targetSelector, 30000);
    });

    it("should verify success message 'Success! Your details have been submitted successfully.' is visible", async () => {
      const successMessageSelector = "div.status.alert.alert-success";
      const text = await pageHelper.getTextContent(page, successMessageSelector);
      assert.equal(text, "Success! Your details have been submitted successfully.");
    });

    it("should click 'Home' button and verify that landed to home page successfully", async () => {
      const homeBtnSelector = "#form-section > a";
      await pageHelper.clickAndWaitForNavigation(page, homeBtnSelector);
      //
      const homePageOrangeSelector = 'li a[href="/"]';
      await browserFunctions.homePage.headerVerifyOrangeInlineColor(page, homePageOrangeSelector);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 7: Verify Test Cases Page", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Test Cases' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "test_cases");
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
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Products' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "products");
    });

    it("should verify user is navigated to ALL PRODUCTS page successfully", async () => {
      await browserFunctions.products.verifyAllProductsPageText(page);
    });

    it("should verify that the products list is visible", async () => {
      const productSelector = "div.product-image-wrapper";
      const nrProducts = 34;
      const products = await page.$$(productSelector);
      assert.equal(products.length, nrProducts);
    });

    it("should click on 'View Product' of first product", async () => {
      const viewFirstProductSelector = 'a[href="/product_details/1"]';
      await page.locator(viewFirstProductSelector).click();
    });

    let parentElement: ElementHandle<HTMLDivElement> | null;
    it("should verify that user is landed to product detail page", async () => {
      const parentSelector = "div.product-information";
      parentElement = await page.locator(parentSelector).waitHandle();
      //missing verification here
    });

    it("should verify that detail detail is visible: product name, category, price, availability, condition, brand", async () => {
      if (!parentElement) {
        assert.fail(`Unable to find parent element`);
      }

      // selector to expected value
      const details = [
        { selector: "h2", expected: "Blue Top" },
        { selector: "p:nth-child(6)", expected: "Availability: In Stock" },
        { selector: "p:nth-child(7)", expected: "Condition: New" },
        { selector: "p:nth-child(8)", expected: "Brand: Polo" },
        { selector: "p:nth-child(3)", expected: "Category: Women > Tops" },
        { selector: "span > span", expected: "Rs. 500" },
      ];

      //
      for (const detail of details) {
        const textContent = await pageHelper.getTextContentFromParent(page, parentElement, detail.selector);
        assert.equal(
          textContent,
          detail.expected,
          `Expected "${detail.expected}" but got "${textContent}" for selector "${detail.selector}"`
        );
      }
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 9: Search Product", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click on 'Products' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "products");
    });

    it("should verify user is navigated to ALL PRODUCTS page successfully", async () => {
      await browserFunctions.products.verifyAllProductsPageText(page);
    });

    const searchedValue = "blue";

    it("should enter product name in search input and click search button", async () => {
      const searchInputSelector = "#search_product";
      const searchHandle = await pageHelper.waitForElement(page, searchInputSelector, 10000);

      if (searchHandle) {
        await searchHandle.type(searchedValue);
        await page.click("#submit_search");
      } else {
        assert.fail("Search field not found!");
      }
    });

    it("should verify 'SEARCHED PRODUCTS' is visible", async () => {
      const textSel = ".padding-right > div > h2";
      const text = await pageHelper.getTextContent(page, textSel);

      assert.equal(text?.toUpperCase(), "SEARCHED PRODUCTS");
    });

    it("should verify all the products related to search are visible", async () => {
      const el = ".features_items div.col-sm-4";
      const searchResults = await page.$$(el);

      for (const el of searchResults) {
        const textContent = await pageHelper.getTextContentFromParent(page, el, "p");
        assert.equal(textContent?.toLowerCase().includes(searchedValue), true);
        // console.log(textContent);
      }
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 10: Verify Subscription in home page", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should scroll down to footer", async () => {
      await pageHelper.scrollElementIntoView(page, "#footer");
    });

    it("should verify text 'SUBSCRIPTION'", async () => {
      await browserFunctions.homePage.footerVerifySubscriptionText(page);
    });

    it("should enter email address in input and click arrow button", async () => {
      // success subscribe message not visible
      const sel = "#success-subscribe > div";
      const isVisible = await pageHelper.elementIsVisible(page, sel);
      assert.equal(isVisible, false);

      await browserFunctions.homePage.footerSubscribeEmail(page, settings.testUrls.automationExercise.email);
    });

    it("should verify success message 'You have been successfully subscribed!' is visible", async () => {
      await browserFunctions.homePage.footerVerifySubscriptionMessage(page);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 11: Verify Subscription in Cart page", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click 'Cart' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "cart");
    });

    it("should scroll down to footer", async () => {
      await pageHelper.scrollElementIntoView(page, "#footer");
    });

    it("should verify text 'SUBSCRIPTION'", async () => {
      await browserFunctions.homePage.footerVerifySubscriptionText(page);
    });

    it("should enter email address in input and click arrow button", async () => {
      await browserFunctions.homePage.footerSubscribeEmail(page, settings.testUrls.automationExercise.email);
    });

    it("should verify success message 'You have been successfully subscribed!' is visible", async () => {
      await browserFunctions.homePage.footerVerifySubscriptionMessage(page);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 12: Add Products in Cart", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click 'Products' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "products");
    });

    it("should hover over first product and click 'Add to cart'", async () => {
      await browserFunctions.products.addProduct(page, 2);
    });

    it("should click 'Continue Shopping' button", async () => {
      await browserFunctions.products.continueShopping(page);
    });
    it("should hover over second product and click 'Add to cart'", async () => {
      await browserFunctions.products.addProduct(page, 3);
      await browserFunctions.products.continueShopping(page);
    });

    it("should Click 'View Cart' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "cart");
    });

    let cartProductHandlesList: ElementHandle[];
    it("should verify both products are added to Cart", async () => {
      const cartProductSelector = 'tr[id^="product"]';
      cartProductHandlesList = await page.$$(cartProductSelector);
      assert.equal(cartProductHandlesList.length, 2);
    });

    it("should verify their prices, quantity and total price", async () => {
      const prodInfoInfo = [
        {
          price: "400",
          quantity: "1",
          totalPrice: "400",
        },
        {
          price: "1000",
          quantity: "1",
          totalPrice: "1000",
        },
      ];

      for (let i = 0; i < prodInfoInfo.length; i++) {
        const expectedDetails = prodInfoInfo[i];
        const actualDetails = await browserFunctions.products.cartGetProductDetailsFromHandle(
          cartProductHandlesList[i] as ElementHandle<HTMLTableRowElement>
        );
        assert.deepStrictEqual(actualDetails, expectedDetails);
      }
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("Test Case 13: Verify Product quantity in Cart", () => {
    it("should navigate to home page", async () => {
      page = await browserFunctions.homePage.goToHomePage(browser, userAgent);
    });

    it("should click 'View Product' for any product on home page", async () => {
      //
      await pageHelper.clickAndWaitForNavigation(page, 'a[href="/product_details/1"]');
    });

    // let element: ElementHandle<HTMLDivElement> | null = null;
    it("should verify product detail is opened", async () => {
      try {
        await page.waitForSelector("div.product-details", { timeout: 5000 });
      } catch (_) {
        assert.fail("Product details page is not open!");
      }
    });

    let quantity = "4";
    it("should Increase quantity to 4", async () => {
      const selector = "#quantity";
      await pageHelper.clearInputField(page, selector);
      await pageHelper.typeText(page, "#quantity", quantity);
    });

    it("should click 'Add to cart' button", async () => {
      const btn = await pageHelper.clickUntilSelectorAppears(page, "button.cart", "div.modal-footer > button", 5000);
      await btn?.click();
    });

    it("should click 'View Cart' button", async () => {
      await browserFunctions.homePage.headerAccessNavbarMenu(page, "cart");
    });

    it("should verify that product is displayed in cart page with exact quantity", async () => {
      const details = await browserFunctions.products.cartGetProductDetails(page, "1");
      assert.equal(details.quantity, quantity);
    });

    it("should close page", async () => {
      await page.close();
    });
  });

  describe("", () => {});
  describe("", () => {});
  describe("", () => {});
});
