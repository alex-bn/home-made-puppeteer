import puppeteer, { ElementHandle } from "puppeteer";
import UtilityClass from "./UtilityClass";
import assert from "node:assert";

const pageHelper = new UtilityClass();
const url = "http://www.uitestingplayground.com/visibility";
const url1 = "https://devexpress.github.io/testcafe/example/";

// tests
(async function () {
  const browser = await puppeteer.launch({ headless: "new", defaultViewport: null });
  const [page] = await browser.pages();

  try {
    await pageHelper.initiate(page);

    // arrange
    await pageHelper.loadPage(url1);
    // act
    const attr = await pageHelper.getAttribute(`[data-testid="populate-button"]`, "data-testid");
    // assert
    // assert.equal(attr, "Populate");
    console.log(attr);
  } catch (error) {
    console.log(error);
  } finally {
    await pageHelper.close();
    await browser.close();
  }
})();
