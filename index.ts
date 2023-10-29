// import puppeteer, { ElementHandle } from "puppeteer";
import puppeteer, { ElementHandle } from "puppeteer";
import UtilityClass from "./UtilityClass";
import assert from "node:assert";

const pageHelper = new UtilityClass();
const url = "https://devexpress.github.io/testcafe/example/";
// tests
(async function () {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const [page] = await browser.pages();

  try {
    await pageHelper.initiate(page);
    await pageHelper.loadPage(url, {
      waitUntil: "networkidle2",
    });

    const elHandle = await page.$("#main-form > div > header > p");
    const result = await pageHelper.elementContainsText(elHandle as ElementHandle<Element>, "TestCafe");
    assert.equal(result, true);

    const count = await pageHelper.countElements("fieldset:nth-child(2) > p");
    assert.equal(count, 5);

    const isVisible = await pageHelper.elementIsVisible("div > #testcafe-rank");
    assert.equal(isVisible, false);
    const visHandle = await page.$("div > #testcafe-rank");
    const isVisible2 = await visHandle?.isIntersectingViewport();
    assert.equal(isVisible2, false);

    const loadingPageWasSuccessfulAndElementIsPresent = await pageHelper.loadPageAndExpectElement(
      url,
      "#tried-section > label"
    );
    assert.ok(loadingPageWasSuccessfulAndElementIsPresent, "Element was not found.");

    const el = await pageHelper.getElementByText(
      "/html/body/form/div/div[1]/div[1]/fieldset[2]/p/label",
      "Continuous integration"
    );
    console.log(await el.evaluate((el) => el.textContent, el));

    const typeHandle = await page.$("#developer-name");
    await pageHelper.typeSlowly(
      typeHandle as ElementHandle<Element>,
      "some long text to be type very slowly until boredom becomes the norm and pooping unicorns start singing Hallelujah"
    );
  } catch (error) {
    console.log(error);
  } finally {
    await pageHelper.close();
    await browser.close();
  }
})();
