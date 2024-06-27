import { ConsoleMessage } from "puppeteer";
import UtilityClass from "./utils/UtilityClass";
import settings from "../src/tests/_settings.json";
import { Browser, ElementHandle, Page } from "puppeteer";
import assert from "node:assert";
import { describe, it, before, after } from "node:test";
import UserAgent from "user-agents";
import BrowserFunctions from "../src/test-clients/automation-exercise/BrowserFunctions";
import Helpers from "../src/test-clients/automation-exercise/Helpers";
import puppeteer from "puppeteer-extra";
import Adblocker from "puppeteer-extra-plugin-adblocker";

//
const URL = settings.testUrls.automationExercise.webAppUrl;
const pageHelper = new UtilityClass();
const browserFunctions = new BrowserFunctions(URL);
const userAgent = new UserAgent();
const helpers = new Helpers();
puppeteer.use(Adblocker({ blockTrackers: true }));
let browser: Browser;
async function main() {
  try {
    browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
    const page = await browserFunctions.homePage.goToHomePage(browser, userAgent);

    await pageHelper.sleep(900000);

    await page.close();
  } catch (error) {
    console.log(error);
  } finally {
    await browser?.close();
  }
}
main();
