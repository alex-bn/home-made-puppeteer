import puppeteer, { Page, Browser } from "puppeteer";

export default class PuppeteerManager {
  private headless: boolean;
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(headless: boolean) {
    this.headless = headless;
  }

  // # abstraction 1
  private async withBrowser(fn: (browser: Browser) => Promise<void>) {
    this.browser = await puppeteer.launch({ headless: this.headless, ignoreHTTPSErrors: true });
    try {
      await fn(this.browser);
    } finally {
      await this.browser.close();
    }
  }

  // # abstraction 2
  private async withPage(fn: (page: Page) => Promise<void>) {
    if (!this.browser) {
      throw new Error("Browser is not initialized");
    }

    [this.page] = await this.browser.pages();
    try {
      await fn(this.page);
    } finally {
      await this.page.close();
    }
  }

  // # abstraction 3
  public async puppeteerAsyncDisposer(testFunction: (page: Page, ...args: any[]) => Promise<void>, ...args: any[]) {
    await this.withBrowser(async (browser) => {
      await this.withPage(async (page) => {
        await testFunction(page, ...args);
      });
    });
  }
}
