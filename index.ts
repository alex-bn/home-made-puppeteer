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
    await pageHelper.loadPage(url);

    // pptr bug?!
    // const visHandle = await page.$("div > #testcafe-rank");
    // const isVisible2 = await visHandle?.isIntersectingViewport();
    // assert.equal(isVisible2, false);
  } catch (error) {
    console.log(error);
  } finally {
    await pageHelper.close();
    await browser.close();
  }
})();
