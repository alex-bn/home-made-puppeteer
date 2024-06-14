import { ElementHandle, GoToOptions, Page, WaitForSelectorOptions } from "puppeteer";
import readline from "node:readline";

// if you need to bind the function to the instance (e.g., if you plan to use it as a callback), using a function expression assigned to a class property can be more appropriate
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

  // check if element is not obstructed by another
  async isNotObstructed(page: Page, selector: string) {
    return await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;

      // Calculate Center Point:
      const { top, left, bottom, right } = element.getBoundingClientRect();
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;

      // Check Element at Center Point:
      const elementAtPoint = document.elementFromPoint(x, y);

      // Verify Element Containment:
      return element.contains(elementAtPoint);
    }, selector);
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
      console.error("waitAndClick", error);
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
      } catch (e) {
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
      console.error("Error in getTextContent:", error);
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

  //////////////////////////////////////
  // needs more testing and adjusting //
  //////////////////////////////////////

  // ?
  async isVisibleAndNotObstructed(page: Page, selector: string) {
    return await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;

      const rect = element.getBoundingClientRect();
      const isVisible = !!(rect.top || rect.bottom || rect.width || rect.height);
      if (!isVisible) return false;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(centerX, centerY);

      return element.contains(elementAtPoint);
    }, selector);
  }

  // ?
  async loadPage(page: Page, url: string, options?: GoToOptions | undefined): Promise<void> {
    try {
      await Promise.all([page.goto(url, options), page.waitForResponse((response) => response.ok())]);
    } catch (error) {
      console.error(error);
    }
  }

  // ?
  async getElementHandle(page: Page, selector: string): Promise<ElementHandle | undefined> {
    try {
      const elementHandle = await page.$(selector);
      if (elementHandle) return elementHandle;
    } catch (error) {
      console.error(error);
    }
  }

  // ?
  async changeInputValue(elementHandle: ElementHandle<HTMLInputElement>, value: string): Promise<void> {
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

  // ?
  async typeIntoElement(elementHandle: ElementHandle<HTMLInputElement>, value: string, delay?: number): Promise<void> {
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

  // ?
  /**
   * @async
   * Locate elements within frames or perform a sequence of searches.
   * @param {string[] | string} selector - The selector of the element to find.
   * @param {string} frameSelector - The selector of the frame element where the search will be performed (optional).
   * @param {WaitForSelectorOptions} options - (Optional) Wait for selector properties object.
   */
  async waitForSelector(
    page: Page,
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
        const elHandle = await page?.waitForSelector(frameSelector);
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

  // ?
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

  // ?
  async countElements(page: Page, selector: string): Promise<number> {
    return await page.$$eval(selector, (items) => items.length);
  }

  // ?
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

          // const centerX = rect.left + rect.width / 2;
          // const centerY = rect.top + rect.height / 2;
          // const elementAtPoint = document.elementFromPoint(centerX, centerY);

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
      console.error("Error in elementIsVisible:", error);
      return false;
    }
  }

  // ?
  /**
   * Provides a way to check if an element is disabled.
   * @param {string} selector - The selector of the element to check.
   * @param {number} timeout - The maximum time (in milliseconds) to check for the element.
   */
  async isDisabled(page: Page, selector: string, timeout: number) {
    try {
      const isDisabled = await page.waitForSelector(`${selector}[disabled]`, {
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

  // ?
  /**
   * @async Returns the value of an element's attribute.
   * @param {string} selector - The selector of the element to check.
   * @param {string} attribute - Attribute of the given element.
   */
  async getAttribute(page: Page, selector: string, attribute: string) {
    try {
      return await page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
    } catch (error) {
      console.error("Error in getAttribute:", error);
    }
  }

  // ?
  /**
   * @async Get CSS properties of a given element.
   * @param {ElementHandle} elementHandle - ElementHandle representing an in-page DOM input element.
   */
  async getCSSProps(page: Page, elementHandle: ElementHandle) {
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
}
