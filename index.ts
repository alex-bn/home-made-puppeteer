// import puppeteer, { ElementHandle } from "puppeteer";
import puppeteer, { ElementHandle } from "puppeteer";
import UtilityClass from "./UtilityClass";

const pageHelper = new UtilityClass({
  headless: false,
  defaultViewport: null,
});

// tests
(async function () {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const [page] = await browser.pages();

  try {
    // await pageHelper.initiate();
    await pageHelper.loadPage("https://yopmail.com/en/wm", { waitUntil: "networkidle2" }, page);

    await pageHelper.waitAndClick("#accept");

    const handle = await page.$("#login");

    await pageHelper.typeIntoElement(handle as ElementHandle<HTMLInputElement>, "test");

    await page.keyboard.press("Enter"); // *

    // overkill ?
    const el = await pageHelper.waitForSelector(
      ["body > header > div:nth-child(3) > div:nth-child(3)"],
      "#ifmail"
    );

    const text = await el?.evaluate((el) => el?.lastChild?.textContent?.trim());
    console.log(text);

    await pageHelper.loadPage("https://example.com", { waitUntil: "networkidle2" });
  } catch (error) {
    console.log(error);
  } finally {
    await pageHelper.close();
    await browser.close();
  }
})();
