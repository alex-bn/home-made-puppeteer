import { ElementHandle, GoToOptions, Page } from "puppeteer";
import readline from "node:readline";
import fs from "fs";
import path from "path";

// extend the global Window interface to include clickEvents
declare global {
  interface Window {
    clickEvents: Array<{
      timestamp: number;
      x: number;
      y: number;
      target: string;
      targetId: string;
      targetClass: string;
    }>;
  }
}

export default class UtilityClass {
  ///////////////////////
  // tested & adjusted //
  ///////////////////////

  // shadow DOM - click
  async clickFromShadowDOM(page: Page, shadowRootNodeSelector: string, shadowDOMTargetElementSelector: string) {
    await page.evaluate(
      (shadowHostSelector: string, targetSelector: string) => {
        const shadowHost = document.querySelector(shadowHostSelector);
        if (!shadowHost) throw new Error("Shadow host not found");

        const shadowRoot = shadowHost.shadowRoot;
        if (!shadowRoot) throw new Error("Shadow root not found");

        const targetElement = shadowRoot.querySelector(targetSelector);
        if (!targetElement) throw new Error("Target element not found");

        (targetElement as HTMLElement).click();
      },
      shadowRootNodeSelector,
      shadowDOMTargetElementSelector
    );
  }

  // shadow DOM - get text
  async getTextFromShadowDOM(page: Page, shadowRootNodeSelector: string, shadowDOMTargetElementSelector: string) {
    return await page.evaluate(
      (shadowHostSelector: string, targetSelector: string) => {
        const shadowHost = document.querySelector(shadowHostSelector);
        if (!shadowHost) throw new Error("Shadow host not found");

        const shadowRoot = shadowHost.shadowRoot;
        if (!shadowRoot) throw new Error("Shadow root not found");

        const targetElement = shadowRoot.querySelector(targetSelector);
        if (!targetElement) throw new Error("Target element not found");

        return targetElement.textContent?.trim();
      },
      shadowRootNodeSelector,
      shadowDOMTargetElementSelector
    );
  }

  // wait function
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // is element visible ?
  /**
   * Checks if an element is visible and not obstructed on the page.
   *
   * This function performs several checks to determine the visibility of the element:
   * - Verifies if the element is hidden via CSS properties (visibility, display, opacity).
   * - Checks if the element is offscreen.
   * - Ensures the center of the element is not obstructed by other elements.
   *
   * @param {Page} page - The Puppeteer Page object.
   * @param {string} selector - The CSS selector of the element to check.
   * @returns {Promise<boolean>} - Returns true if the element is visible and not obstructed, false otherwise.
   */
  async elementIsVisible(page: Page, selector: string): Promise<boolean> {
    try {
      const element = await page.$(selector);
      if (element) {
        const isElementVisible = await page.evaluate((uiElement) => {
          const style = getComputedStyle(uiElement);
          const rect = uiElement.getBoundingClientRect();
          const isHidden =
            style.visibility === "hidden" || style.display === "none" || style.opacity === "0" || rect.width === 0;
          const isOffscreen =
            rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth;

          if (isHidden || isOffscreen) {
            return false;
          }

          // Calculate Center Point:
          const { top, left, bottom, right } = rect;
          const x = (left + right) / 2;
          const y = (top + bottom) / 2;

          // Check Element at Center Point:
          const elementAtPoint = document.elementFromPoint(x, y);

          // Verify Element Containment and Overlapping:
          const isOverlapped = Array.from(document.elementsFromPoint(x, y)).some((el) => {
            const elStyle = getComputedStyle(el);
            return (
              (el !== uiElement && elStyle.position === "absolute") ||
              elStyle.position === "fixed" ||
              elStyle.zIndex > style.zIndex
            );
          });

          return uiElement.contains(elementAtPoint) && !isOverlapped;
        }, element);

        return isElementVisible;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // click & wait for network idle
  async clickAndWaitForNetworkIdle(page: Page, selector: string) {
    try {
      const selectorHandle = await page.waitForSelector(selector);
      if (selectorHandle) {
        const idlePromise = page.waitForNetworkIdle({ idleTime: 1000 });
        await selectorHandle.click();
        await idlePromise;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // get element by xpath
  async getElementByXPath(page: Page, xpathSelector: string, timeout?: number): Promise<ElementHandle<Element>> {
    // #2 - get element
    const element = await page.waitForSelector(`::-p-xpath(${xpathSelector})`, { timeout });

    if (!element) {
      throw new Error(`Element not found for XPath: ${xpathSelector}`);
    }

    return element;
  }

  // cheeky wait & click
  async waitAndClick(page: Page, selector: string): Promise<void> {
    try {
      await Promise.all([page.waitForSelector(selector), page.click(selector)]);
    } catch (error) {
      console.error(error);
    }
  }

  // click & navigate
  async waitAndNavigate(page: Page, selector: string): Promise<void> {
    try {
      await Promise.all([page.waitForNavigation(), page.click(selector)]);
    } catch (error) {
      console.error(error);
    }
  }

  // useful when dealing with OTP
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

  // easy waiting
  /**
   * @async
   * Uses a polling approach with a one-second sleep between retries.
   * @param {string} selector - The selector of the element to check.
   * @param {number} timeout - The maximum time (in milliseconds) to wait for the element to become available.
   */
  async waitForElement(page: Page, selector: string, timeout: number) {
    while (timeout > 0) {
      try {
        return await page.waitForSelector(selector, {
          visible: true,
          timeout: 1000,
        });
      } catch (_) {
        await this.sleep(1000);
        timeout -= 1000;
      }
    }
    return null;
  }

  // get text
  /**
   * @async Returns the text content of a given selector.
   * @param {string} selector - The selector of the element to check.
   */
  async getTextContent(page: Page, selector: string) {
    try {
      const elementHandle = await page.$(selector);
      return (await elementHandle?.evaluate((el) => el.textContent))?.trim();
    } catch (error) {
      console.error(error);
    }
  }

  // waiting
  async clickAndWaitForNavigation(page: Page, selector: string) {
    try {
      const selectorHandle = await page.waitForSelector(selector);
      if (selectorHandle) {
        const navPromise = page.waitForNavigation({
          waitUntil: "networkidle2",
        });
        await selectorHandle.click();
        await navPromise;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // scroll into view
  async scrollElementIntoView(page: Page, selector: string): Promise<void> {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView();
      }
    }, selector);
  }

  // type
  async typeText(page: Page, selector: string, text: string): Promise<void> {
    const selectorHandle = await page.waitForSelector(selector);
    if (selectorHandle) {
      await selectorHandle.type(text);
    } else {
      throw new Error(`Element not found for selector: ${selector}`);
    }
  }

  // get input value
  async getInputValue(page: Page, selector: string): Promise<string> {
    const elementHandle = await page.waitForSelector(selector);
    if (!elementHandle) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    const value = await page.evaluate((element) => {
      return (element as HTMLInputElement).value;
    }, elementHandle);

    return value;
  }

  // load url
  async loadPage(page: Page, url: string, options?: GoToOptions | undefined): Promise<void> {
    try {
      await Promise.all([page.goto(url, options), page.waitForResponse((response) => response.ok())]);
    } catch (error) {
      console.error(error);
    }
  }

  // click event listener
  /**
   * Sets up a click event listener on the provided Puppeteer Page to record click events.
   * @param page - The Puppeteer Page object where the click events will be recorded.
   */
  async setupClickEventsRecorder(page: Page): Promise<void> {
    await page.evaluate(() => {
      // Initialize clickEvents array on the global window object
      window.clickEvents = [];

      // Add an event listener to the document to capture all click events
      document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (!target) return;

        // Capture details about the click event
        const clickDetails = {
          timestamp: Date.now(),
          x: event.clientX,
          y: event.clientY,
          target: target.tagName,
          targetId: target.id,
          targetClass: target.className,
        };

        // Store the click event details in the array
        window.clickEvents.push(clickDetails);
      });
    });
  }

  // retrieves the recorded click
  /**
   * Retrieves the recorded click events from the Puppeteer Page.
   * @param page - The Puppeteer Page object where the click events were recorded.
   * @returns An array of recorded click events.
   */
  async getRecordedClickEvents(page: Page): Promise<any[]> {
    return await page.evaluate(() => window.clickEvents);
  }

  // verify checkbox
  async isCheckboxChecked(page: Page, selector: string) {
    return await page.$eval(selector, (checkbox) => {
      return (checkbox as HTMLInputElement).checked;
    });
  }

  // inline css
  /**
   * Gets the value of an inline style property from a specified element.
   * @param page - The Puppeteer Page object.
   * @param selector - The CSS selector of the element.
   * @param property - The CSS property whose value needs to be retrieved.
   * @returns The value of the specified CSS property, or null if not found.
   */
  async getInlineStylePropertyValue(page: Page, selector: string, property: string): Promise<string | null> {
    try {
      return await page.$eval(
        selector,
        (el, prop) => {
          const element = el as HTMLElement;
          return element.style.getPropertyValue(prop);
        },
        property
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // computed css
  /**
   * @async Get CSS properties of a given element.
   * @param {string} selector - The CSS selector of the element.
   */
  async getComputedStyleProperties(page: Page, selector: string) {
    const elementHandle = await page.$(selector);

    if (elementHandle) {
      // Get the CSS properties of the selected element
      const elementCSS = await page.evaluate((element) => {
        const style = getComputedStyle(element) as CSSStyleDeclaration;
        const computedProperties: { [key: string]: string } = {};
        for (const property in style) {
          if (style.hasOwnProperty(property)) {
            const value = style.getPropertyValue(property);
            if (value) {
              computedProperties[property] = value;
            }
          }
        }
        return computedProperties;
      }, elementHandle);

      return elementCSS;
    } else return null;
  }

  // page scroll
  async scrollDown(page: Page) {
    let prevHeight = -1;
    let maxScrolls = 100;
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");

      await this.sleep(1000);

      let newHeight = (await page.evaluate("document.body.scrollHeight")) as number;

      if (newHeight == prevHeight) {
        break;
      }
      prevHeight = newHeight;
      scrollCount = +1;
    }
  }

  //////////////////////////////////////
  // needs more testing and adjusting //
  //////////////////////////////////////

  // ?
  /**
   * Gets the value of an attribute from a specified element.
   * @param page - The Puppeteer Page object.
   * @param selector - The CSS selector of the element.
   * @param attribute - The attribute whose value needs to be retrieved.
   * @returns The value of the specified attribute, or null if not found.
   */
  async getAttributeValue(page: Page, selector: string, attribute: string): Promise<string | null> {
    try {
      return await page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // ?
  async countElements(page: Page, selector: string): Promise<number> {
    return await page.$$eval(selector, (items) => items.length);
  }

  // ?
  async loadFile(page: Page, selector: string, filePath: string): Promise<void> {
    try {
      // 1 - file exists ?
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // 2 - button available ?
      await page.waitForSelector(selector, { timeout: 5000 });

      // 3 - absolute path
      const absoluteFilePath = path.resolve(filePath);

      // file input of correct type ?
      const inputElement: ElementHandle<HTMLInputElement> | null = (await page.$(
        selector
      )) as ElementHandle<HTMLInputElement>;
      if (inputElement) {
        await inputElement.uploadFile(absoluteFilePath);
      } else {
        throw new Error(`Unable to find file input element: ${selector}`);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
