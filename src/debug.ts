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
const browserFunctions = new BrowserFunctions();
const userAgent = new UserAgent();
const helpers = new Helpers();
puppeteer.use(Adblocker({ blockTrackers: true }));
let browser: Browser;
async function main() {
  try {
    browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
    const page = await browserFunctions.createPageObjectAndGoToHomePage(browser, URL, userAgent);

    await browserFunctions.accessNavbarMenu(page, "contact_us");

    const textSelector = "div.col-sm-8 > div > h2";
    const text1 = await pageHelper.getTextContent(page, textSelector);
    assert.equal(text1?.toUpperCase(), "GET IN TOUCH");

    const nameSelector = 'input[data-qa="name"]';
    const emailSelector = 'input[data-qa="email"]';
    const subjectSelector = 'input[data-qa="subject"]';
    const messageSelector = 'textarea[data-qa="message"]';

    await pageHelper.typeText(page, nameSelector, "Crispy Baker");
    await pageHelper.typeText(page, emailSelector, "cripsy.baker@yopmail.com");
    await pageHelper.typeText(page, subjectSelector, "I am Crispy Baker - fear me");
    await pageHelper.typeText(
      page,
      messageSelector,
      "Just because the cat has kittens in the oven, it don’t make ‘em biscuits."
    );

    const uploadFileSelector = 'input[name="upload_file"]';
    await pageHelper.loadFile(page, uploadFileSelector, "C:/Users/Lisi/Desktop/UtilityClass/tsconfig.json");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const submitSelector = 'input[data-qa="submit-button"]';
    await pageHelper.waitAndClick(page, submitSelector);

    const successMessageSelector = "div.status.alert.alert-success";
    const text = await pageHelper.getTextContent(page, successMessageSelector);
    assert.equal(text, "Success! Your details have been submitted successfully.");

    const homeBtnSelector = "#form-section > a";
    await pageHelper.clickAndWaitForNavigation(page, homeBtnSelector);
    //
    const homePageOrangeSelector = 'li a[href="/"]';
    await browserFunctions.verifyInlineColorIsOrange(page, homePageOrangeSelector);

    await page.close();
  } catch (error) {
    console.log(error);
  } finally {
    await browser?.close();
  }
}
main();
