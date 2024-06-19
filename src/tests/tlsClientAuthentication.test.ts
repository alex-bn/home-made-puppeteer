import { describe, it } from "node:test";
import HttpEngine from "../http-engine/HttpEngine";
import settings from "./_settings.json";
import assert from "assert";
import puppeteer, { Browser } from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import fs from "node:fs";
import axios from "axios";
import https from "node:https";

describe("TLS Client Authentication Test", () => {
  it("TLSv1.2 Authentication OK", async () => {
    const http = new HttpEngine(settings.testUrls.tlsClientAuthentication, settings.certs.pfx, settings.certs.passwd);
    const response = await http.get("/");

    // test
    assert.ok(response.status === 200, "TLS authentication failed!");
    assert.ok(response.data.includes("[SSL_PROTOCOL] => TLSv1.2"), "TLS authentication failed!");
  });

  it("No TLS client certificate presented", async () => {
    const http = new HttpEngine(settings.testUrls.tlsClientAuthentication);
    const response = await http.get("/");

    // test
    assert.ok(response.status === 200, "TLS authentication failed!");
    assert.ok(response.data.includes("Error: No TLS client certificate presented"), "TLS authentication failed!");
  });

  // // still no api to do this test...
  // page.on("dialog", async (dialog) => {
  //   await page.keyboard.press("Enter");
  //   await dialog.accept();
  // });
  it("Selecting certificate from browser popup", async () => {
    const pageHelper = new UtilityClass();
    const browser = await puppeteer.launch(settings.puppeteerLaunchOptions);

    try {
      const page = await browser.newPage();

      // workaround ?
      await page.setRequestInterception(true);

      // // Client cert files
      const cert = fs.readFileSync(settings.certs.cer);
      const key = fs.readFileSync(settings.certs.key);

      page.on("request", async (interceptedRequest) => {
        if (interceptedRequest.url() === "https://server.cryptomix.com/") {
          try {
            // Intercept Request, pull out request options, add in client cert
            const options = {
              url: interceptedRequest.url(),
              method: interceptedRequest.method(),
              headers: interceptedRequest.headers(),
              data: interceptedRequest.postData(),
              httpsAgent: new https.Agent({
                cert: cert,
                key: key,
                rejectUnauthorized: false, // if needed
              }),
            };

            // Make the request with Axios
            const response = await axios(options);

            assert.equal(response.data.includes("TLSv1.2 Authentication OK!"), true);

            // Continue the intercepted request with the Axios response data
            interceptedRequest.respond({
              status: response.status,
              contentType: response.headers["content-type"],
              headers: response.headers,
              body: response.data,
            });
          } catch (error: any) {
            console.error("Request interception error:", error);

            if (error.response) {
              console.error("Response data:", error.response.data);
              console.error("Response status:", error.response.status);
              console.error("Response headers:", error.response.headers);
            }

            interceptedRequest.abort();
          }
        } else {
          interceptedRequest.continue();
        }
      });

      //
      await page.goto(settings.testUrls.tlsClientAuthentication);

      // test
      const text = await pageHelper.getTextContent(page, "body > pre");
      assert.ok(text?.includes("[SSL_CLIENT_SERIAL] => 1F60DD0808D452BF4FD956509B970AF0"));

      //
      // await pageHelper.sleep(3000000);

      //
      await browser.close();
    } catch (error) {
      console.log(error);
    } finally {
      await browser?.close();
    }
  });
});
