import { Page } from "puppeteer";
import UtilityClass from "../../utils/UtilityClass";
import assert from "node:assert";

const pageHelper = new UtilityClass();

export default class BrowserFunctions {
  async visitHomePage(page: Page, url: string) {
    // go to page
    await pageHelper.loadPage(page, url);

    // home page test
    const elementColor = await pageHelper.getInlineStylePropertyValue(page, 'li a[href="/"]', "color");
    assert.equal(elementColor, "orange");
  }

  async selectTitle(page: Page, title: "Mr" | "Mrs") {
    const selector = `input[value="${title}"]`;
    await pageHelper.waitAndClick(page, selector);
  }

  async selectDateOfBirth(page: Page) {
    const days = "#days";
    const month = "#months";
    const year = "#years";

    const daysEl = await page.$(days);
    const monthEl = await page.$(month);
    const yearEl = await page.$(year);

    await daysEl?.select("25");
    await monthEl?.select("5");
    await yearEl?.select("1984");
  }

  async fillAddressInformation(page: Page) {
    const firstName = "#first_name";
    const lastName = "#last_name";
    const company = "#company";
    const address = "#address1";
    const address2 = "#address2";
    const country = "#country";
    const state = "#state";
    const city = "#city";
    const zipCode = "#zipcode";
    const nr = "#mobile_number";

    await pageHelper.typeText(page, firstName, "string");
    await pageHelper.typeText(page, lastName, "string");
    await pageHelper.typeText(page, company, "string");
    await pageHelper.typeText(page, address, "Address * (Street address, P.O. Box, Company name, etc.)");
    await pageHelper.typeText(page, address2, "Address * (Street address, P.O. Box, Company name, etc.)");
    await page.select(country, "Israel");
    await pageHelper.typeText(page, state, "string");
    await pageHelper.typeText(page, city, "string");
    await pageHelper.typeText(page, zipCode, "string");
    await pageHelper.typeText(page, nr, "string");
  }
}
