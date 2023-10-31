import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import UtilityClass from "../UtilityClass";
import assert from "node:assert";
import { describe, test, it, before, after, beforeEach, afterEach, mock } from "node:test";

describe("function tester", () => {
  const url = "https://devexpress.github.io/testcafe/example/";
  const url2 = "http://www.uitestingplayground.com/visibility";
  const url3 = "https://yopmail.com/en/wm";
  const url4 = "http://www.uitestingplayground.com";

  let page: Page;
  let browser: Browser;
  let pageHelper: UtilityClass;

  before(async () => {
    pageHelper = new UtilityClass();
    browser = await puppeteer.launch({
      headless: "new",
      defaultViewport: null,
      // slowMo: 50,
    });
    [page] = await browser.pages();
    await pageHelper.initiate(page);
  });
  after(async () => {
    await browser.close();
    await pageHelper.close();
  });
  test(".elementContainsText()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const elHandle = await page.$("#main-form > div > header > p");
    const elementContainsText = await pageHelper.elementContainsText(
      elHandle as ElementHandle<Element>,
      "TestCafe"
    );
    // assert
    assert.equal(elementContainsText, true);
  });
  test(".countElements()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    const expectedNrOFElements = 5;
    // act
    const count = await pageHelper.countElements("fieldset:nth-child(2) > p");
    // assert
    assert.equal(count, expectedNrOFElements);
  });
  test(".isElementVisible()", async () => {
    // arrange
    await pageHelper.loadPage(url2);
    const triggerButtonHandle = await page.$("button#hideButton");
    await triggerButtonHandle?.click();
    const btnSelectors = [
      { sel: "button#removedButton" },
      { sel: "button#zeroWidthButton" },
      { sel: "button#overlappedButton" },
      { sel: "button#transparentButton" },
      { sel: "button#invisibleButton" },
      { sel: "button#notdisplayedButton" },
      { sel: "button#offscreenButton" },
    ];
    // act
    for (const btn of btnSelectors) {
      const isVisible = await pageHelper.elementIsVisible(btn.sel);
      assert.equal(isVisible, false); // all should be false
    }
  });
  test(".getElementHandle()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const isNull = await page.$("div.slider-values.active");
    assert.equal(null, isNull); // element is not active
    const elHandle = await pageHelper.getElementHandle("#tried-section > label");
    await elHandle?.click();
    // assert
    const is = await page.$("div.slider-values.active");
    assert.ok(is, "Your dummy test failed."); // after click element is active
  });
  test.skip(".getElementByText()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const el = await pageHelper.getElementByText(
      "/html/body/form/div/div[1]/div[1]/fieldset[2]/p/label",
      "Continuous integration"
    );
    // assert
    assert.equal(
      await el.evaluate((el) => el.textContent, el),
      "Easy embedding into a Continuous integration system"
    );
  });
  test(".sleep()", async () => {
    // arrange
    const wait = 500; // milliseconds
    const approximateExpectedDuration = 0.55; // sec
    await pageHelper.loadPage(url);
    // act
    const tick = process.hrtime();
    await pageHelper.sleep(wait);
    const tack = process.hrtime(tick);
    const duration = tack[0] + tack[1] / 1e9;
    //assert
    assert.ok(duration <= approximateExpectedDuration, "Your dummy test has failed");
  });
  test(".changeElementValue()", async () => {
    // arrange
    const newValue = "new-test-value";
    await pageHelper.loadPage(url);
    const elHandle = await page.$("#developer-name");
    // act
    await pageHelper.changeElementValue(elHandle as ElementHandle<HTMLInputElement>, newValue);
    // assert
    const inputValue = await elHandle?.evaluate((el) => {
      if (el instanceof HTMLInputElement) {
        return el.value;
      }
      return null;
    });
    assert.equal(inputValue, newValue);
  });
  test(".typeIntoElement()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    const expectedValue = "some-random-dummy-value";
    const typeHandle = await page.$("#developer-name");
    // act
    await pageHelper.typeIntoElement(typeHandle as ElementHandle<HTMLInputElement>, expectedValue);
    // assert
    const inputValue = await typeHandle?.evaluate((el) => {
      if (el instanceof HTMLInputElement) {
        return el.value;
      }
      return null;
    });
    assert.ok(inputValue === expectedValue, "Your dummy test has failed");
  });
  test(".waitForSelector()", async () => {
    // arrange
    await pageHelper.loadPage(url3, { waitUntil: "networkidle2" });
    await pageHelper.waitAndClick("#accept");
    const handle = await page.$("#login");
    await pageHelper.typeIntoElement(handle as ElementHandle<HTMLInputElement>, "test");
    await page.keyboard.press("Enter");
    // act
    const el = await pageHelper.waitForSelector(
      ["body > header > div:nth-child(3) > div:nth-child(3)"],
      "#ifmail"
    );
    const text = await el?.evaluate((el) => el?.lastChild?.textContent?.trim());
    // assert
    assert.ok(text);
  });
  test(".waitAndClick()", async () => {
    // arrange
    await pageHelper.loadPage(url4, { waitUntil: "networkidle2" });
    await pageHelper.waitAndClick("div:nth-child(4) > div:nth-child(2) > h3 > a");
    await pageHelper.waitAndClick("#login");
    const handle = await page.$("#loginstatus");
    const text = await handle?.evaluate((el) => el.textContent);
    assert.equal(text, "Invalid username/password");
  });
  test(".waitForElement()", async () => {
    // arrange
    await pageHelper.loadPage(url4, { waitUntil: "networkidle2" });
    const expectedText = "Quality is not an act, it is a habit.";
    //
    const isNull = await pageHelper.waitForElement("some-selector", 2000);
    assert.equal(isNull, null);
    //
    const elHandle = await pageHelper.waitForElement("#citation > p", 5000);
    const text = await elHandle?.evaluate((el) => el.textContent);
    assert.equal(text, expectedText);
  });
  test(".isDisabled()", async () => {
    // arrange
    await pageHelper.loadPage(url, { waitUntil: "networkidle2" });

    const isDisabled = await pageHelper.isDisabled("#submit-button", 1000);
    assert.equal(isDisabled, true);

    const notDisabled = await pageHelper.isDisabled("#populate", 1000);
    assert.equal(notDisabled, false);
  });
  test(".getTextContent()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const text = await pageHelper.getTextContent("header > p");
    // assert
    assert.equal(text, "This webpage is used as a sample in TestCafe tutorials.");
  });
  test(".getAttribute()", async () => {
    // arrange
    const expectedValue = "populate-button";
    await pageHelper.loadPage(url);
    // act
    const attr = await pageHelper.getAttribute(`[data-testid="populate-button"]`, "data-testid");
    // assert
    assert.equal(attr, expectedValue);
  });
});
