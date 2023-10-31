import puppeteer, {
  Browser,
  ElementHandle,
  GoToOptions,
  Page,
  PuppeteerLaunchOptions,
  WaitForSelectorOptions,
} from "puppeteer";
import readline from "node:readline";

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
   * @async
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
   * @async
   * Signals the completion of the closing operation.
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * @async
   * Wait for a specified number of milliseconds.
   * @param {number} ms - The number of milliseconds to sleep.
   */
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * @async
   * Wait for 500 milliseconds.
   */
  async sleepShort(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  /**
   * @async
   * Wait for 2500 milliseconds.
   */
  async sleepLong(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 2500));
  }

  /**
   * @async
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
   * @async
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
   * @async
   * Evaluates an XPath expression relative to the page document, searches for the first HTML element
   * containing the specified text, waits for it to become visible and for the network to idle,
   * and returns the matching element.
   * @param {string} xpathSelector - The XPath expression for the element to find.
   * @param {string} text - The text content to look for within the element.
   * @throws {Error} Throws an error if the page is not available, if the element with the specified
   * text is not found, or if the element is not visible.
   * @returns {Promise<ElementHandle<Element>>} A promise that resolves to the matching HTML element.
   */
  async getElementByText(xpathSelector: string, text: string): Promise<ElementHandle<Element>> {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    const [element] = (await this.page.$x(
      `${xpathSelector}[contains(text(),"${text}")]`
    )) as ElementHandle<Element>[];
    if (!element) {
      throw new Error(`Can't find ${xpathSelector} with ["${text}")]`);
    }
    const isVisible = await element.isIntersectingViewport();

    if (!isVisible) {
      throw new Error(`${xpathSelector} with "${text}" is not visible`);
    }
    return element;
  }

  /**
   * @async
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
   * @async
   * Clears the existing text and types into an HTMLInputElement field.
   * @param {ElementHandle<HTMLInputElement>} elementHandle - ElementHandle representing an in-page DOM input element.
   * @param {string} value - The value to set for the element.
   * @param {number} delay - Delay in milliseconds.
   * @example
   * await pageHelper.typeIntoElement(elHandle as ElementHandle<HTMLInputElement>, "your-text-here");
   */
  async typeIntoElement(
    elementHandle: ElementHandle<HTMLInputElement>,
    value: string,
    delay?: number
  ): Promise<void> {
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

    await elementHandle.type(textToType, { delay });
  }

  /**
   * @async
   * Locate elements within frames or perform a sequence of searches.
   * @param {string[] | string} selector - The selector of the element to find.
   * @param {string} frameSelector - The selector of the frame element where the search will be performed (optional).
   * @param {WaitForSelectorOptions} options - (Optional) Wait for selector properties object.
   */
  async waitForSelector(
    selector: string[] | string,
    frameSelector?: string,
    options?: WaitForSelectorOptions
  ): Promise<ElementHandle<Node>> {
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
   * @async
   * Waits for a selector to appear and then clicks on the element.
   * @param {string} selector - The selector of the element to find and click.
   */
  async waitAndClick(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    try {
      await Promise.all([this.page.waitForSelector(selector), this.page.click(selector)]);
    } catch (error) {
      console.log("Error in waitAndClick:", error);
    }
  }

  /**
   * @async
   * Designed for situations where the input field expects a code received at runtime via SMS or a similar method which is not accessible via script.
   * @returns {Promise<string>} A promise that resolves to the user's input from the console.
   * @example
   * const textFromTheConsole = await pageHelper.waitForUserInput();
   * await inputHandle?.type(textFromTheConsole);
   */
  async waitForUserInput(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) =>
      rl.question("Type your text here:", (answer) => {
        rl.close();
        resolve(answer);
      })
    );
  }

  /**
   * @async
   * Performs a text-lookup and will return a boolean as the result.
   * @param {ElementHandle} elementHandle - ElementHandle representing an in-page DOM input element.
   * @param {string} expectedText - Expected lookup text.
   * @example
   * const result = await pageHelper.elementContainsText(elHandle as ElementHandle<Element>, "TestCafe");
    assert.equal(result, true);
   */
  async elementContainsText(elementHandle: ElementHandle, expectedText: string): Promise<boolean> {
    try {
      const result = await elementHandle.evaluate((element: Element | null, text: string) => {
        if (element instanceof HTMLElement && element.innerText.includes(text)) {
          return true;
        }
        return false;
      }, expectedText);

      return result as boolean;
    } catch (error) {
      console.error("Error in elementContainsText:", error);
      return false;
    }
  }

  /**
   * @async
   * Given a selector, counts how many nodes are on the current page.
   * @param {string} selector - The selector to count elements.
   * @returns {Promise<number>} A promise that resolves to the count of elements matching the selector.
   */
  async countElements(selector: string): Promise<number> {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }

    const count = await this.page.$$eval(selector, (items) => items.length);
    return count;
  }

  /**
   * @async
   * Accounts for visibility hidden, display none, opacity 0, width 0, offscreen, removed/not found and overlapped elements
   * @param {string} selector - The selector of the element to check.
   * @returns {Promise<boolean>} A promise that resolves to true if the element is visible, or false if not.
   */
  async elementIsVisible(selector: string): Promise<boolean> {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    try {
      const element = await this.page.$(selector);
      if (element) {
        const isElementVisible = await this.page.evaluate((uiElement) => {
          const style = getComputedStyle(uiElement);
          const rect = uiElement.getBoundingClientRect();
          const isHidden =
            style.visibility === "hidden" ||
            style.display === "none" ||
            style.opacity === "0" ||
            rect.width === 0;
          const isOffscreen =
            rect.bottom < 0 ||
            rect.top > window.innerHeight ||
            rect.right < 0 ||
            rect.left > window.innerWidth;

          if (isHidden || isOffscreen) {
            return false;
          }

          // Check for overlapping elements with higher z-index or absolute/fixed positioning
          const overlappingElements = Array.from(
            document.elementsFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
          );
          const isOverlapped = overlappingElements.some((el) => {
            const elStyle = getComputedStyle(el);
            return (
              (el !== uiElement && elStyle.position === "absolute") ||
              elStyle.position === "fixed" ||
              elStyle.zIndex > style.zIndex
            );
          });

          return !isOverlapped;
        }, element);

        return isElementVisible;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error in elementIsVisible:", error);
      return false;
    }
  }

  /**
   * @async
   * Uses a polling approach with a one-second sleep between retries.
   * @param {string} selector - The selector of the element to check.
   * @param {number} timeout - The maximum time (in milliseconds) to wait for the element to become available.
   */
  async waitForElement(selector: string, timeout: number) {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    while (timeout > 0) {
      try {
        return await this.page.waitForSelector(selector, {
          visible: true,
          timeout: 1000,
        });
      } catch (e) {
        await this.sleep(1000);
        timeout -= 1000;
      }
    }
    return null;
  }

  /**
   * Provides a way to check if an element is disabled.
   * @param {string} selector - The selector of the element to check.
   * @param {number} timeout - The maximum time (in milliseconds) to check for the element.
   */
  async isDisabled(selector: string, timeout: number) {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    try {
      const isDisabled = await this.page.waitForSelector(`${selector}[disabled]`, {
        timeout,
      });
      if (isDisabled) {
        return true;
      } else {
        return false;
      }
    } catch (_) {
      return false;
    }
  }

  // maybe too much ?
  async isElementReady(selector: string) {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    try {
      const elementHandle = await this.page.$(selector);
      const isVisibleHandle = await this.page.evaluateHandle((e) => {
        const style = window.getComputedStyle(e as Element);
        return style && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      }, elementHandle);
      const visible = await isVisibleHandle.jsonValue();
      const box = await elementHandle?.boxModel();

      if (visible && box) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /**
   * @async Returns the text content of a given selector.
   * @param {string} selector - The selector of the element to check.
   */
  async getTextContent(selector: string) {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    try {
      const elementHandle = await this.page.$(selector);
      return (await elementHandle?.evaluate((el) => el.textContent))?.trim();
    } catch (error) {
      console.log("Error in getTextContent:", error);
    }
  }

  /**
   * @async Returns the value of an element's attribute.
   * @param {string} selector - The selector of the element to check.
   * @param {string} attribute - Attribute of the given element.
   */
  async getAttribute(selector: string, attribute: string) {
    if (!this.page) {
      throw new Error("Page is not available. Please call initiate or provide a page object.");
    }
    try {
      return await this.page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
    } catch (error) {
      console.log("Error in getAttribute:", error);
    }
  }
}
