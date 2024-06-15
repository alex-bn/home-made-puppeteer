import puppeteer, { Browser, Page } from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import assert from "node:assert";
import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import UserAgent from "user-agents";
import settings from "./_settings.json";

describe("uiTestingPlayground - Test scenarios", () => {
  let page: Page;
  let browser: Browser;
  let pageHelper: UtilityClass;

  before(async () => {
    pageHelper = new UtilityClass();
    browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
  });
  beforeEach(async () => {
    const userAgent = new UserAgent();
    page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await pageHelper.loadPage(page, settings.testUrls.uiTestingPlayground);
  });
  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });
  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  // can run in isolation
  it("Scenario: Click", async () => {
    // http://www.uitestingplayground.com/click

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/click"]');

    // #2 - get button element
    const elementSelector = "#badButton";
    const elHandle = await page.$(elementSelector);

    // #3 - check class before click
    const beforeCLickExpectedClass = "btn btn-primary";
    const beforeClick = await (await elHandle?.getProperty("className"))?.jsonValue();
    assert.equal(beforeClick, beforeCLickExpectedClass);

    // #4 - click
    await elHandle?.click();

    // #5 - test
    const afterCLickExpectedClass = "btn btn-success";
    const afterClick = await (await elHandle?.getProperty("className"))?.jsonValue();
    assert.equal(afterClick, afterCLickExpectedClass);
  });

  it("Scenario: Mouse Over", async () => {
    // http://www.uitestingplayground.com/mouseover

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/mouseover"]');

    // #2 - hover
    await page.hover('a[title="Click me"]');

    // #3 - get element
    const clickMeElement = await page.$('a[title="Active Link"]');

    // #4 - click
    const expectedClicks = 2;
    for (let i = 0; i < expectedClicks; i++) {
      await clickMeElement?.click({ delay: 1000 });
    }

    // #5 - test
    const getClicks = await pageHelper.getTextContent(page, "#clickCount");
    assert.equal(getClicks, expectedClicks);
  });

  it("Scenario: Verify Text", async () => {
    // http://www.uitestingplayground.com/verifytext

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/verifytext"]');

    // #2 - get trimmed text
    const playgroundElementText = await pageHelper.getTextContent(page, ".bg-primary > span.badge-secondary");

    // #3 - test
    const expectedText = "Welcome UserName!";
    assert.equal(playgroundElementText, expectedText);
  });

  it("Scenario: Hidden Layers", async () => {
    // http://www.uitestingplayground.com/hiddenlayers

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/hiddenlayers"]');

    // before click -> is visible = true
    const greenButtonSelector = "#greenButton";
    const isNotObstructedBeforeClick = await pageHelper.elementIsVisible(page, greenButtonSelector);
    assert.equal(isNotObstructedBeforeClick, true);

    // #2 - click
    await page.click(greenButtonSelector);

    // after click -> is visible = false
    const isObstructedAfterClick = await pageHelper.elementIsVisible(page, greenButtonSelector);
    assert.equal(isObstructedAfterClick, false);

    // #3 - force a 2nd click
    const greenButtonElement = await page.$(greenButtonSelector);
    await page.evaluate((element) => (element as HTMLElement).click(), greenButtonElement);

    // #4 - test
    const warningTextFromPage = "User can not click green button in the current application state!";
    const warningSelector = "div:nth-child(2) > p";
    const warningText = await pageHelper.getTextContent(page, warningSelector);
    assert.equal(warningText, warningTextFromPage);
  });

  it("Scenario: Load Delay", async () => {
    // http://www.uitestingplayground.com/loaddelay

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/loaddelay"]');

    // #2 - test
    const buttonSelector = "div > button";
    const expectedText = "Button Appearing After Delay";
    const buttonText = await pageHelper.getTextContent(page, buttonSelector);
    assert.equal(buttonText, expectedText);
  });

  it("Scenario: Client Side Delay", async () => {
    // http://www.uitestingplayground.com/clientdelay

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/clientdelay"]');

    // #2 - click
    await pageHelper.waitAndClick(page, "#ajaxButton");

    // #3 - wait
    const loadedLabelSelector = "#content > p";
    const elHandle = await pageHelper.waitForElement(page, loadedLabelSelector, 20000);

    // #4 - test
    elHandle
      ? assert.equal(await pageHelper.getTextContent(page, loadedLabelSelector), "Data calculated on the client side.")
      : assert.fail("Test failed!");
  });

  it("Scenario: Text Input", async () => {
    // http://www.uitestingplayground.com/textinput

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/textinput"]');

    // #2 - type
    const inputSelector = "#newButtonName";
    const newValue = "New-Button";
    await page.type(inputSelector, newValue, { delay: 100 });

    // #3 - click
    const buttonSelector = "#updatingButton";
    await (await page.$(buttonSelector))?.click();

    // #4 - test
    const getText = await pageHelper.getTextContent(page, buttonSelector);
    assert.equal(getText, newValue);
  });

  it("Scenario: Progress Bar", async () => {
    // http://www.uitestingplayground.com/progressbar

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/progressbar"]');

    // #2 - get progress-bar element
    const progressBarSelector = "#progressBar";
    const progressBarElement = await page.$(progressBarSelector);

    // #3 - press start
    await page.click("#startButton");

    // #4 - Check progress
    let progressBarValue = 0;
    const timeout = 30000;
    const startTime = Date.now();
    while (progressBarValue <= 75) {
      progressBarValue = Number(await page.evaluate((el) => el?.getAttribute("aria-valuenow"), progressBarElement));

      // break if timeout reached
      if (Date.now() - startTime > timeout) {
        throw new Error("Progress bar did not reach the expected value within the timeout period.");
      }

      await pageHelper.sleep(100);
    }

    // #5 - press stop
    await page.click("#stopButton");

    // #6 - test
    const maxExpectedValue = 78;
    assert(
      progressBarValue <= maxExpectedValue,
      `Progress bar value (${progressBarValue}) exceeded the maximum expected value (${maxExpectedValue}).`
    );
  });

  it("Scenario: nbsp xPath", async () => {
    // https://stackoverflow.com/questions/48165646/how-can-i-get-an-element-by-xpath

    // http://www.uitestingplayground.com/nbsp

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/nbsp"]');

    // #2 - get element
    const xpathSelector = "//button[contains(., 'Button')]";
    const el = await pageHelper.getElementByXPath(page, xpathSelector, 3000);

    // #3 - click
    await el?.click();

    // #4 - test
    assert.equal(true, true);

    // need to solve non-breaking space issue..
  });

  it("Scenario: Class Attribute", async () => {
    // http://www.uitestingplayground.com/classattr

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/classattr"]');

    // #2 - get element
    const btnPrimary = "button.btn.btn-primary.btn-test";
    const btnPrimaryHandle = await page.waitForSelector(btnPrimary);

    // #3 - set up a dialog event handler
    page.on("dialog", async (dialog) => {
      // #5 - test
      assert.equal(dialog.message(), "Primary button pressed");
      if (dialog.message().includes("Primary button pressed")) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });

    // #4 - click
    await btnPrimaryHandle?.click();

    // #6 - test
    assert.equal(true, true);
  });

  it("Scenario: Dynamic Table", async () => {
    // http://www.uitestingplayground.com/dynamictable

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/dynamictable"]');

    // #2 - get element
    const current_element = await page.waitForSelector("::-p-xpath(//span[contains(., 'Chrome')])");

    // #3 - get parent
    const parent_node = await current_element?.getProperty("parentNode");

    // #4 - get value
    const chromeCPU = await page.evaluate((el) => {
      let value: string | undefined;
      el?.childNodes.forEach((child) => {
        if (child.textContent?.includes("%")) {
          value = child.textContent;
        }
      });

      return value;
    }, parent_node);

    // #5 - get warning value
    const warningSelector = "p.bg-warning";
    const text = await pageHelper.getTextContent(page, warningSelector);

    // #6 - test
    assert.equal(chromeCPU, text?.split(": ")[1]);
  });

  it("Scenario: Sample App", async () => {
    // http://www.uitestingplayground.com/sampleapp

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/sampleapp"]');

    // #2 - get initial status
    const loginStatusSelector = "#loginstatus";
    const initialStatus = "User logged out.";
    const statusBeforeLogin = await pageHelper.getTextContent(page, loginStatusSelector);
    assert.equal(statusBeforeLogin, initialStatus);

    // #3 - log in
    const userNameSelector = 'input[name="UserName"]';
    const passwdSelector = 'input[name="Password"]';
    const loginButtonSelector = "#login";
    const userName = "userName";
    const passwd = "pwd";
    await page.type(userNameSelector, userName);
    await page.type(passwdSelector, passwd);
    await page.click(loginButtonSelector); // usually there is a loading here that you need to account for in your login-function

    // #4 - test status after login
    const expectedFinalStatus = `Welcome, ${userName}!`;
    const statusAfterLogin = await pageHelper.getTextContent(page, loginStatusSelector);
    assert.equal(statusAfterLogin, expectedFinalStatus);
  });

  it("Scenario: Shadow DOM", async () => {
    // http://www.uitestingplayground.com/shadowdom

    // 1 - set clipboard permission
    const context = browser.defaultBrowserContext();
    await context.overridePermissions("https://www.uuidgenerator.net/guid", ["clipboard-read"]);

    // shadow DOM
    {
      // #2 - access test
      await pageHelper.clickAndWaitForNavigation(page, 'a[href="/shadowdom"]');

      // #3 - selectors
      const shadowRootNodeSelector = "div > guid-generator";
      const shadowDOMGenerateBtnSelector = "#buttonGenerate";
      const shadowDOMCopyBtnSelector = "#buttonCopy";

      // #4 - click generate
      await pageHelper.clickFromShadowDOM(page, shadowRootNodeSelector, shadowDOMGenerateBtnSelector);

      // #5 - click copy
      await pageHelper.clickFromShadowDOM(page, shadowRootNodeSelector, shadowDOMCopyBtnSelector);

      // #6 - test -> implicit verification that all of the above code has executed
      assert.equal(true, true);

      // The test cannot proceed further using Puppeteer because the uitestingplayground domain is not secure, operating over HTTP instead of HTTPS.
      // Trying to override permission over HTTP will give: Protocol error (Browser.grantPermissions): Permissions can't be granted in current context.
    }

    // Next section will demonstrate clipboard value verification using a domain that operates over HTTPS
    {
      //
      await pageHelper.loadPage(page, "https://www.uuidgenerator.net/guid");

      // pass consent screen
      const consentSelector = 'button[aria-label="Consent"]';
      await page.click(consentSelector);

      // copy to clipboard
      const cpSel = "#copy-button-text";
      await pageHelper.clickAndWaitForNetworkIdle(page, cpSel);

      // get clipboard value
      const clipboardValue = await page.evaluate(() => navigator.clipboard.readText());

      // get page value
      const pageValue = await pageHelper.getTextContent(page, "#generated-uuid");

      // test
      assert.equal(clipboardValue, pageValue);
    }
  });

  it("Scenario: Overlapped Element", async () => {
    // http://www.uitestingplayground.com/overlapped

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/overlapped"]');

    // test id input typed text
    const idSelector = "#id";
    const idTypedText = "idTypedText";
    await pageHelper.typeText(page, idSelector, idTypedText);
    const idInputValue = await pageHelper.getInputValue(page, idSelector);
    assert.equal(idTypedText, idInputValue);

    // test name input typed text
    const nameSelector = "#name";
    const nameTypedText = "nameTypedText";
    await pageHelper.scrollElementIntoView(page, nameSelector);
    await pageHelper.typeText(page, nameSelector, nameTypedText);
    const nameInputValue = await pageHelper.getInputValue(page, nameSelector);
    assert.equal(nameTypedText, nameInputValue);
  });

  it("Scenario: Visibility", async () => {
    // http://www.uitestingplayground.com/visibility

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/visibility"]');

    // #2 - selectors
    const hideBtn = "#hideButton";
    const hiddenButtons = [
      "#transparentButton",
      "#removedButton",
      "#invisibleButton",
      "#notdisplayedButton",
      "#zeroWidthButton",
      "#overlappedButton",
      "#offscreenButton",
    ];

    // #3 - press hide
    await page.click(hideBtn);

    // #4 - test visible button
    const isNotHidden = await pageHelper.elementIsVisible(page, hideBtn);
    assert.equal(isNotHidden, true);

    // #5 test not visible buttons
    for (const button of hiddenButtons) {
      const isVisible = await pageHelper.elementIsVisible(page, button);
      assert.equal(isVisible, false);
    }
  });

  it("Scenario: Scrollbars", async () => {
    // http://www.uitestingplayground.com/scrollbars

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/scrollbars"]');

    // #2 - scroll button into view
    const hidingButtonSelector = "#hidingButton";
    await pageHelper.scrollElementIntoView(page, hidingButtonSelector);

    // #3 - set up click events recorder
    await pageHelper.setupClickEventsRecorder(page);

    // #4 - click
    await page.click(hidingButtonSelector);

    // #5 - retrieve recorded click props
    const clickEvents = await pageHelper.getRecordedClickEvents(page);

    // #6 - assert the properties of the first recorded click event
    assert.deepStrictEqual(
      {
        target: clickEvents[0].target.toUpperCase(),
        targetId: clickEvents[0].targetId,
        targetClass: clickEvents[0].targetClass,
      },
      {
        target: "BUTTON",
        targetId: "hidingButton",
        targetClass: "btn btn-primary",
      }
    );
  });

  it("Scenario: AJAX Data", async () => {
    // http://www.uitestingplayground.com/ajax

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/ajax"]');

    // #2 - trigger ajax call
    const ajaxRequestBtnTriggerSelector = "#ajaxButton";
    await pageHelper.waitAndClick(page, ajaxRequestBtnTriggerSelector);

    // #3 - wait for data
    const ajaxDataSelector = "#content > p";
    const ajaxDataNode = await pageHelper.waitForElement(page, ajaxDataSelector, 15000);
    const data = await ajaxDataNode?.evaluate((element) => {
      return (element as HTMLElement).textContent;
    });

    // #4 - test data
    assert.equal(data?.trim(), "Data loaded with AJAX get request.");
  });

  it("Scenario: Dynamic ID", async () => {
    // http://www.uitestingplayground.com/dynamicid

    // #1 - access test
    await pageHelper.clickAndWaitForNavigation(page, 'a[href="/dynamicid"]');

    // #2 - setup click event recorder
    await pageHelper.setupClickEventsRecorder(page);

    // #3 - click by xpath selector
    const btnSelector = "//div[@class='container']/button";
    await page.click(`::-p-xpath(${btnSelector})`);

    // #4 - get recorded clicks
    const clickEvents = await pageHelper.getRecordedClickEvents(page);

    // #5 - test
    assert.deepStrictEqual(
      {
        x: clickEvents[0].x,
        y: clickEvents[0].y,
        target: clickEvents[0].target.toUpperCase(),
        targetClass: clickEvents[0].targetClass,
      },
      {
        x: 173,
        y: 416,
        target: "BUTTON",
        targetClass: "btn btn-primary",
      }
    );
  });
});
