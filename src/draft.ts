import puppeteer, { Browser, ConsoleMessage } from "puppeteer";
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
    let pageIndex;

    page.on("console", (message: ConsoleMessage) => {
      const consoleMessageText = message.text();
      if (consoleMessageText.includes("[pageIndex=")) {
        pageIndex = consoleMessageText;
      }
    });

    // #
    await page.goto(settings.testUrls.infiniteAjaxScroll);

    // #
    let prevHeight = -1;
    let maxScrolls = 100;
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");

      await pageHelper.sleep(1000);

      let newHeight = (await page.evaluate("document.body.scrollHeight")) as number;

      console.log(pageIndex);

      if (pageIndex == "Page changed [pageIndex=10]") {
        break;
      }
      prevHeight = newHeight;
      scrollCount = +1;
    }
  } catch (error) {
    console.log(error);
  } finally {
    await browser?.close();
  }
}
main();
