import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import UtilityClass from "../UtilityClass";
import assert from "node:assert";
import { describe, test, it, before, after, beforeEach, afterEach } from "node:test";

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

  test("getElementByText", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const el = await pageHelper.getElementByText(
      "/html/body/form/div/div[1]/div[1]/fieldset[2]/p/label",
      "Continuous integration"
    );
    // assert
    assert.equal(
      await el?.evaluate((el) => el.textContent, el),
      "Easy embedding into a Continuous integration system"
    );
  });
  test("elementContainsText", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const elHandle = await page.$("#main-form > div > header > p");
    const result = await pageHelper.elementContainsText(elHandle as ElementHandle<Element>, "TestCafe");
    // assert
    assert.equal(result, true);
  });
  test("countElements", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const count = await pageHelper.countElements("fieldset:nth-child(2) > p");
    // assert
    assert.equal(count, 5);
  });
  test("isElementVisible", async () => {
    // arrange
    await pageHelper.loadPage(url);
    // act
    const isVisible = await pageHelper.elementIsVisible("div > #testcafe-rank");
    // assert
    assert.equal(isVisible, false);
  });
  test("loadPageAndExpectElement", async () => {
    // arrange & act
    const loadingPageWasSuccessfulAndElementIsPresent = await pageHelper.loadPageAndExpectElement(
      url,
      "#tried-section > label"
    );
    // assert
    assert.ok(loadingPageWasSuccessfulAndElementIsPresent, "Element was not found.");
  });
  test("getElementByText", async () => {
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
  test("typeSlowly", async () => {
    // arrange
    await pageHelper.loadPage(url);
    const typeHandle = await page.$("#developer-name");
    // act
    await pageHelper.typeSlowly(
      typeHandle as ElementHandle<Element>,
      "some long text to be typed very slowly until boredom becomes the norm and pooping unicorns start singing Hallelujah",
      0
    );
    // assert
  });
});
