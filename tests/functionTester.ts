import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import UtilityClass from "../UtilityClass";
import assert from "node:assert";
import { describe, test, it, before, after, beforeEach, afterEach, mock } from "node:test";

describe("function tester", () => {
  const url = "https://devexpress.github.io/testcafe/example/";
  let page: Page;
  let browser: Browser;
  let pageHelper: UtilityClass;

  before(async () => {
    pageHelper = new UtilityClass();
    browser = await puppeteer.launch({
      headless: true,
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

  test(".loadPageAndExpectElement()", async () => {
    // arrange & act
    const expectedResult = true;
    const isPageLoadedAndElementFound = await pageHelper.loadPageAndExpectElement(
      url,
      "#preferred-interface"
    );
    // assert
    assert.ok(isPageLoadedAndElementFound === expectedResult, "Your dummy test failed.");
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
    await pageHelper.loadPage(url);
    // act
    const isVisible = await pageHelper.elementIsVisible("div > #testcafe-rank");
    // assert
    assert.equal(isVisible, false);
  });
  test(".getElementHandle()", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const elHandle = await pageHelper.getElementHandle("#tried-section > label");
    await elHandle?.click();
    // assert
  });
  test(".getElementByText()", async () => {
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
  test(".typeSlowly()", async () => {
    // arrange
    const expectedValue =
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem";
    await pageHelper.loadPage(url);
    const typeHandle = await page.$("#developer-name");
    const delay = 10; // milliseconds
    // act
    const startTime = process.hrtime();
    await pageHelper.typeSlowly(typeHandle as ElementHandle<Element>, expectedValue, delay);
    const endTime = process.hrtime(startTime);
    const duration = endTime[0] + endTime[1] / 1e9; // Convert to seconds
    // assert
    assert.ok(duration < 1.35, "Your dummy test has failed."); // should give ~1.3
    const inputValue = await typeHandle?.evaluate((el) => {
      if (el instanceof HTMLInputElement) {
        return el.value;
      }
      return null;
    });
    assert.equal(inputValue, expectedValue);
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
    test(".waitAndClick()", async () => {
      // arrange
      await pageHelper.loadPage("https://yopmail.com/en/wm", { waitUntil: "networkidle2" });
      await pageHelper.waitAndClick("#accept");
      const handle = await page.$("#login");
      await pageHelper.typeIntoElement(handle as ElementHandle<HTMLInputElement>, "test");
      await page.keyboard.press("Enter");
    });
    // act
    const el = await pageHelper.waitForSelector(
      ["body > header > div:nth-child(3) > div:nth-child(3)"],
      "#ifmail"
    );
    const text = await el?.evaluate((el) => el?.lastChild?.textContent?.trim());
    // assert
  });
  test("waitForUserInput", async () => {
    // need to test this somehow
  });
});
