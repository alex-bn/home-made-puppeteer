import puppeteer, { Browser, Page } from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import assert from "node:assert";
import { describe, it, after } from "node:test";
import UserAgent from "user-agents";
import settings from "./_settings.json";

describe("devExpress - Simple form", () => {
  let page: Page;
  let browser: Browser;
  let pageHelper: UtilityClass;

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  // cannot run in isolation
  it("Scenario: load form page", async () => {
    // prep page
    pageHelper = new UtilityClass();
    browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
    const userAgent = new UserAgent();
    page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await pageHelper.loadPage(page, settings.testUrls.devExpress);

    // test
    const pageTitle = await page.title();
    assert.equal(pageTitle, "TestCafe Example Page");

    // test
    const headerSelector = "header > h1";
    const headerText = await pageHelper.getTextContent(page, headerSelector);
    assert.equal(headerText, "Example");

    // test
    const headerParagraphSelector = "header > p";
    const paragraphText = await pageHelper.getTextContent(page, headerParagraphSelector);
    assert.equal(paragraphText, "This webpage is used as a sample in TestCafe tutorials.");
  });

  it("Scenario: get text from shadow root", async () => {
    const shadowHostSelector = "#shadow-host";
    const shadowDOMTargetSelector = "#shadow-paragraph";

    const hiddenParagraph = await pageHelper.getTextFromShadowDOM(page, shadowHostSelector, shadowDOMTargetSelector);
    assert.equal(hiddenParagraph, "This paragraph is in the shadow tree");
  });

  it("Scenario: should fill input field", async () => {
    // fill
    const inputFieldSelector = "#developer-name";
    const testValue = "test test";
    await pageHelper.typeText(page, inputFieldSelector, testValue);

    // test
    const inputValue = await pageHelper.getInputValue(page, inputFieldSelector);
    assert.equal(testValue, inputValue);
  });

  it("Scenario: should press button & confirm dialog", async () => {
    // set event listener
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // click
    const btnSelector = "#populate";
    await pageHelper.waitAndClick(page, btnSelector);

    // test
    const inputFieldSelector = "#developer-name";
    const text = await pageHelper.getInputValue(page, inputFieldSelector);
    const defaultDevName = "Peter Parker";
    assert.equal(text, defaultDevName);
  });

  it("Scenario: should click all checkboxes", async () => {
    const inputCheckBoxes = [
      "#remote-testing",
      "#reusing-js-code",
      "#background-parallel-testing",
      "#continuous-integration-embedding",
      "#traffic-markup-analysis",
    ];
    // test before click
    for (const checkbox of inputCheckBoxes) {
      const isChecked = await pageHelper.isCheckboxChecked(page, checkbox);
      assert.equal(isChecked, false);
    }

    // click
    for (const checkBox of inputCheckBoxes) {
      await page.click(checkBox);
    }

    // test after click
    for (const checkbox of inputCheckBoxes) {
      const isChecked = await pageHelper.isCheckboxChecked(page, checkbox);
      assert.equal(isChecked, true);
    }
  });

  it("Scenario: should check active slider", async () => {
    // slider is disabled
    const sliderDivSelector = "#slider";
    const sliderClassBeforeActivation = await pageHelper.getAttributeValue(page, sliderDivSelector, "class");
    assert.equal(sliderClassBeforeActivation?.includes("ui-slider-disabled ui-state-disabled"), true);

    // click
    const testCafeSelector = "#tried-test-cafe";
    await page.click(testCafeSelector);

    // slider is enabled
    const sliderClassAfterActivation = await pageHelper.getAttributeValue(page, sliderDivSelector, "class");
    assert.equal(sliderClassAfterActivation?.includes("ui-slider-disabled ui-state-disabled"), false);
  });

  it("Scenario: should rate test cafe", async () => {
    // click
    const sliderSelector = "#slider > span";
    await page.click(sliderSelector);

    // get inline style value for left and test
    const inlineStyleLeftValueBefore = await pageHelper.getInlineStylePropertyValue(page, sliderSelector, "left");
    assert.equal(inlineStyleLeftValueBefore, "0%");

    // press arrow right
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowRight");
    }

    // get inline style value for left and test
    const inlineStyleLeftValueAfter = await pageHelper.getInlineStylePropertyValue(page, sliderSelector, "left");
    assert.equal(inlineStyleLeftValueAfter, "33.3333%");
  });

  it("Scenario: should choose primary os", async () => {
    // select & test
    const winSelector = "#windows";
    await page.click(winSelector);
    const isChecked = await pageHelper.isCheckboxChecked(page, winSelector);
    assert.equal(isChecked, true);

    // test other options
    const list = ["#macos", "#linux"];
    for (const checkbox of list) {
      const isChecked = await pageHelper.isCheckboxChecked(page, checkbox);
      assert.equal(isChecked, false);
    }
  });

  it("Scenario: should choose drop-down option", async () => {
    // data
    const selector = "#preferred-interface";
    const option = "JavaScript API";

    // select
    await page.select(selector, option);

    // test
    const value = await pageHelper.getInputValue(page, selector);
    assert.equal(option, value);
  });

  it("Scenario: should add comment", async () => {
    // type comment
    const textAreaSelector = "#comments";
    const lorem =
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
    await pageHelper.typeText(page, textAreaSelector, lorem);

    // test
    const value = await pageHelper.getInputValue(page, textAreaSelector);
    assert.equal(value, lorem);
  });

  it("Scenario: should submit form", async () => {
    // submit
    const submitBtnSelector = "#submit-button";
    await pageHelper.waitAndNavigate(page, submitBtnSelector);

    // test landing page
    const defaultDevName = "Peter Parker";
    const text = await pageHelper.getTextContent(page, "#article-header");
    assert.equal(`Thank you, ${defaultDevName}!`, text);

    // test title
    const pageTitle = await page.title();
    assert.equal(pageTitle, "Thank you!");
  });
});
