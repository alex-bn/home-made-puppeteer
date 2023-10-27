import puppeteer, {
  Browser,
  ElementHandle,
  GoToOptions,
  Page,
  PuppeteerLaunchOptions,
  WaitForSelectorOptions,
} from "puppeteer";

/**
 * @class This is a sample class representing a collection of utility functions to be used with puppeteer library.
 */
export default class UtilityClass {
  #options: PuppeteerLaunchOptions;
  private browser: Browser | null;
  private page: Page | null;

  /**
   * @constructor
   * Creates a new UtilityClass instance.
   * @param {PuppeteerLaunchOptions} options - (Optional) Options to configure launching behavior.
   */
  constructor(options?: PuppeteerLaunchOptions) {
    this.#options = (options as PuppeteerLaunchOptions) || undefined;
    this.browser = null;
    this.page = null;
  }

  /**
   * @method
   * Initiate the browser and page with class objects or use an existing page object.
   * @param {Page} page - (Optional) The method can accept a page object from outside the class.
   */
  async initiate(page?: Page): Promise<void> {
    if (!page) {
      this.browser = await puppeteer.launch(this.#options);
      const pages = await this.browser.pages();
      if (pages.length > 0) {
        this.page = pages[0];
      } else {
        throw new Error("No pages available");
      }
    } else if (page) {
      this.page = page;
    }
  }

  /**
   * @method
   * Signals the completion of the closing operation.
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    } else {
      console.log("Browser variable is null, closing operation must be done manually.");
    }
  }

  /**
   * @method
   * Wait for a specified number of milliseconds.
   * @param {number} ms - The number of milliseconds to sleep.
   */
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * @method
   * Wait for 500 milliseconds.
   */
  async sleepShort(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  /**
   * @method
   * Wait for 2500 milliseconds.
   */
  async sleepLong(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 2500));
  }

  /**
   * @method
   * Visits a given resource and waits for the page to load.
   * @param {string} url - Address of a given unique resource on the Web.
   * @param {Page} page - (Optional) The method can accept a page object from outside the class.
   */
  async loadPage(url: string, options?: GoToOptions | undefined, page?: Page): Promise<void> {
    if (page) {
      this.page = page;
    }
    if (this.page) {
      await Promise.all([
        this.page.goto(url, options),
        this.page.waitForResponse((response) => response.ok()),
      ]);
    } else {
      console.error("Page is null. Please call initiate or provide a page object.");
    }
  }

  /**
   * @method
   * Returns the ElementHandle for the node that matches the selector, or resolves to null if not found.
   * @param {string} selector - The selector of the element to retrieve.
   * @returns {Promise<ElementHandle | null>} The ElementHandle of the matching element, or null if not found.
   */
  async getElementHandle(selector: string): Promise<ElementHandle | null> {
    if (this.page) {
      const elementHandle = await this.page.$(selector);
      if (elementHandle) return elementHandle;
    }
    return null;
  }

  /**
   * @method
   * Changes the value of an HTMLInputElement element and dispatches the change event.
   * @param {ElementHandle<HTMLInputElement>} elementHandle - ElementHandle representing an in-page DOM input element.
   * @param {string} value - The value to set for the element.
   * @example
   * await pageHelper.changeElementValue(elHandle as ElementHandle<HTMLInputElement>, "some-text-here");
   */
  async changeElementValue(elementHandle: ElementHandle<HTMLInputElement>, value: string): Promise<void> {
    await elementHandle.focus();
    await elementHandle.evaluate((input, value) => {
      input.value = value;
      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );
      input.dispatchEvent(
        new Event("change", {
          bubbles: true,
        })
      );
    }, value);
  }

  /**
   * @method
   * Clears the existing text and types into an HTMLInputElement field.
   * @param {ElementHandle<HTMLInputElement>} elementHandle - ElementHandle representing an in-page DOM input element.
   * @param {string} value - The value to set for the element.
   * @example
   * await pageHelper.typeIntoElement(elHandle as ElementHandle<HTMLInputElement>, "your-text-here");
   */
  async typeIntoElement(elementHandle: ElementHandle<HTMLInputElement>, value: string): Promise<void> {
    const textToType = await elementHandle.evaluate((input, newValue) => {
      if (newValue.length <= input.value.length || !newValue.startsWith(input.value)) {
        input.value = "";
        return newValue;
      }
      const originalValue = input.value;
      input.value = "";
      input.value = originalValue;
      return newValue.substring(originalValue.length);
    }, value);

    await elementHandle.type(textToType, { delay: 100 });
  }

  /**
   * @method
   * This function is designed to be versatile and handle different scenarios where you might need to locate elements within frames or perform a sequence of searches. It also provides comprehensive error handling if the elements are not found.
   * @param {string[] | string} selector - The selector of the element to find.
   * @param {string} frameSelector - The selector of the frame element where the search will be performed (optional).
   * @param {WaitForSelectorOptions} options - (Optional) Wait for selector properties object.
   */
  async waitForSelector(
    selector: string[] | string,
    frameSelector?: string,
    options?: WaitForSelectorOptions
  ) {
    if (!Array.isArray(selector)) {
      selector = [selector];
    }
    if (!selector.length) {
      throw new Error("Empty selector provided to waitForSelector");
    }
    let element = null;
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i];
      if (element) {
        element = await element.waitForSelector(part, options);
      } else if (frameSelector) {
        const elHandle = await this.page?.waitForSelector(frameSelector);
        if (elHandle) {
          const frame = await elHandle.contentFrame();
          element = await frame?.waitForSelector(part, options);
        }
      }
      if (!element) {
        throw new Error("Could not find element: " + selector.join(">>"));
      }
      if (i < selector.length - 1) {
        element = (await element.evaluateHandle((el) => (el.shadowRoot ? el.shadowRoot : el))).asElement();
      }
    }
    if (!element) {
      throw new Error("Could not find element: " + selector.join("|"));
    }
    return element;
  }

  /**
   * @method
   * Waits for a selector to appear and then clicks on the element.
   * @param {string} selector - The selector of the element to find and click.
   */
  async waitAndClick(selector: string) {
    if (this.page) {
      await Promise.all([this.page.waitForSelector(selector), this.page.click(selector)]);
    } else {
      console.error("Page is null. Please call initiate or provide a page object.");
    }

    return Promise.resolve();
  }
}
