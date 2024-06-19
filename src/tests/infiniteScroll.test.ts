import puppeteer, { Browser, ConsoleMessage, Page } from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import assert from "node:assert";
import { describe, it, before, after } from "node:test";
import UserAgent from "user-agents";
import settings from "./_settings.json";

describe("infiniteScroll - Test scenario", () => {
  let page: Page;
  let browser: Browser;
  let pageHelper: UtilityClass;

  before(async () => {
    pageHelper = new UtilityClass();
    browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
    const userAgent = new UserAgent();
    page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await pageHelper.loadPage(page, settings.testUrls.infiniteAjaxScroll);
  });
  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it("Scenario: scroll first 10 pages and stop test", async () => {
    let pageIndex;

    // # configure event listener
    page.on("console", (message: ConsoleMessage) => {
      const consoleMessageText = message.text();
      if (consoleMessageText.includes("[pageIndex=")) {
        pageIndex = consoleMessageText;
      }
    });

    // # load page
    await page.goto(settings.testUrls.infiniteAjaxScroll);
    const scrollToPage = 10;

    // #
    let prevHeight = -1;
    let maxScrolls = 100;
    let scrollCount = 0;

    // scroll until page 10
    while (scrollCount < maxScrolls) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");

      await pageHelper.sleep(1000);

      let newHeight = (await page.evaluate("document.body.scrollHeight")) as number;

      console.log(pageIndex);

      if (pageIndex == `Page changed [pageIndex=${scrollToPage}]`) {
        break;
      }
      prevHeight = newHeight;
      scrollCount = +1;
    }
  });
});
