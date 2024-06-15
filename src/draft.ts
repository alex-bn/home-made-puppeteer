import puppeteer, { Browser } from "puppeteer";
import UtilityClass from "./utils/UtilityClass";
import settings from "./tests/_settings.json";
import assert from "node:assert";

const pageHelper = new UtilityClass();

// tests
let browser: Browser;
async function main() {
  try {
    browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    // #
    await page.goto(settings.testUrls.devExpress);

    //
    await pageHelper.sleep(99999999);
  } catch (error) {
    console.log(error);
  } finally {
    await browser?.close();
  }
}
main();
