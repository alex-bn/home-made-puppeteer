import puppeteer from "puppeteer";
import assert from "assert/strict";
import { Browser, Page, ConsoleMessage, HTTPResponse } from "puppeteer";

// do you cors much ?
export default class CORSPolicy {
  private browser: Browser | null;
  private page: Page | null;
  private isHeadless: boolean;

  constructor(isHeadless = false) {
    this.browser = null;
    this.page = null;
    this.isHeadless = isHeadless;
  }

  private async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: this.isHeadless,
      devtools: true,
    });
    this.page = await this.browser.newPage();
  }

  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // has to be post
  async blockedByCORSPolicy(apiUrl: string, host: string) {
    let browserCorsError: string = "";

    try {
      await this.launchBrowser();

      if (!this.page) throw new Error("Page is not initialized");

      this.page.on("console", (message: ConsoleMessage) => {
        const consoleMessageText = message.text();
        if (consoleMessageText.includes("blocked by CORS policy")) {
          browserCorsError = consoleMessageText;
        }
      });

      await this.page.goto(host);
      await this.page.evaluate((url) => {
        fetch(url, { method: "POST" });
      }, apiUrl);

      await this.page.waitForNetworkIdle({ idleTime: 500 }).then(() => {
        const expectedCorsErrorMessage = `Access to fetch at '${apiUrl}' from origin '${host}' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.`;
        assert.equal(browserCorsError, expectedCorsErrorMessage);
      });

      assert.equal(true, true);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Test failed:", error.message);
      } else {
        console.error("Test failed with an unknown error:", error);
      }
      assert.fail("Test failed!");
    } finally {
      await this.closeBrowser();
    }
  }

  // has to be post
  async CORSAllowedHost(apiUrl: string, expectedResponse: Record<string, any>, host: string) {
    let browserApiCallResponse: string = "";

    try {
      await this.launchBrowser();

      if (!this.page) throw new Error("Page is not initialized");

      this.page.on("response", async (response: HTTPResponse) => {
        if (response.status() === 200 && response.url() === apiUrl) {
          const buffer = await response.buffer();
          browserApiCallResponse = JSON.parse(buffer.toString());
        }
      });

      await this.page.goto(host, { waitUntil: "networkidle0" });
      await this.page.evaluate((url) => {
        fetch(url, { method: "POST" })
          .then((res) => res.text())
          .then(console.log);
      }, apiUrl);

      await this.page.waitForNetworkIdle({ idleTime: 500 }).then(() => {
        assert.deepStrictEqual(browserApiCallResponse, expectedResponse);
      });
      assert.equal(true, true);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Test failed:", error.message);
      } else {
        console.error("Test failed with an unknown error:", error);
      }
      assert.fail("Test failed!");
    } finally {
      await this.closeBrowser();
    }
  }
}
