import puppeteer, { Browser, ElementHandle, KeyInput } from "puppeteer";
import UtilityClass from "./utils/UtilityClass";
import assert from "node:assert";

const pageHelper = new UtilityClass();
const uiTestingPlaygroundUrl = "http://www.uitestingplayground.com";
const testCafeUrl = "https://devexpress.github.io/testcafe/example/";

// tests
let browser: Browser;
async function main() {
  try {
    browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions("https://www.uuidgenerator.net/guid", ["clipboard-read"]);
    const page = await context.newPage();

    // #
    await page.goto(uiTestingPlaygroundUrl);

    // #1 - access test

    // shadow DOM
    {
      // #2 - access test
      await pageHelper.clickAndWaitForNavigation(page, 'a[href="/shadowdom"]');

      // #3 - selectors
      const shadowRootNodeSelector = "div > guid-generator";
      const shadowDOMGenerateBtnSelector = "#buttonGenerate";
      const shadowDOMCopyBtnSelector = "#buttonCopy";
      const shadowDOMFieldSelector = "#editField";

      // #4 - click generate
      await pageHelper.clickFromShadowDOM(page, shadowRootNodeSelector, shadowDOMGenerateBtnSelector);

      // #5 - click copy
      await pageHelper.clickFromShadowDOM(page, shadowRootNodeSelector, shadowDOMCopyBtnSelector);

      // #6 - test -> implicit verification that all of the above code has executed
      assert.equal(true, true);

      // The test cannot proceed further using Puppeteer because the uitestingplayground domain is not secure, operating over HTTP instead of HTTPS.
      // Trying to override permission on http will give: Protocol error (Browser.grantPermissions): Permissions can't be granted in current context.
    }

    // Next section will demonstrate clipboard value verification using a domain that operates over HTTPS
    {
      //
      await pageHelper.loadPage(page, "https://www.uuidgenerator.net/guid");

      // pass consent screen
      const consentSelector = 'button[aria-label="Consent"]';
      await page.click(consentSelector);

      // copy to clipboard
      const cpSel = "#copy-button-text";
      await pageHelper.clickAndWaitForNetworkIdle(page, cpSel);

      // get clipboard value
      const clipboardValue = await page.evaluate(() => navigator.clipboard.readText());

      // get page value
      const pageValue = await pageHelper.getTextContent(page, "#generated-uuid");

      // test
      assert.equal(clipboardValue, pageValue);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await browser?.close();
  }
}
main();
