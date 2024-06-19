import { describe, it } from "node:test";
import HttpEngine from "../http-engine/HttpEngine";
import settings from "./_settings.json";
import assert from "assert";
import puppeteer from "puppeteer";
import UtilityClass from "../utils/UtilityClass";
import fs from "fs";
import axios from "axios";
import https from "https";

describe("TLS Client Authentication Test", () => {
  const TLS_TEST_URL = settings.testUrls.tlsClientAuthentication;
  const CERT_PATH = settings.certs.cer;
  const KEY_PATH = settings.certs.key;
  const PFX_PATH = settings.certs.pfx;
  const PFX_PASS = settings.certs.passwd;

  it("TLSv1.2 Authentication OK", async () => {
    const http = new HttpEngine(TLS_TEST_URL, PFX_PATH, PFX_PASS);
    const response = await http.get("/");

    // test
    assert.ok(response.status === 200, "TLS authentication failed!");
    assert.ok(response.data.includes("[SSL_PROTOCOL] => TLSv1.2"), "TLS authentication failed!");
  });

  it("No TLS client certificate presented", async () => {
    const http = new HttpEngine(TLS_TEST_URL);
    const response = await http.get("/");

    // test
    assert.ok(response.status === 200, "TLS authentication failed!");
    assert.ok(response.data.includes("Error: No TLS client certificate presented"), "TLS authentication failed!");
  });

  it("Select certificate from browser popup - workaround", async () => {
    const pageHelper = new UtilityClass();
    const browser = await puppeteer.launch(settings.puppeteerLaunchOptions);
    let page;

    try {
      page = await browser.newPage();

      // set req intercept
      await page.setRequestInterception(true);

      // client cert files
      const cert = fs.readFileSync(CERT_PATH);
      const key = fs.readFileSync(KEY_PATH);

      page.on("request", async (interceptedRequest) => {
        if (interceptedRequest.url() === TLS_TEST_URL) {
          try {
            // intercept request, pull out request options, add in client cert
            const options = {
              url: interceptedRequest.url(),
              method: interceptedRequest.method(),
              headers: interceptedRequest.headers(),
              data: interceptedRequest.postData(),
              httpsAgent: new https.Agent({
                cert: cert,
                key: key,
              }),
            };

            // make the request with Axios
            const response = await axios(options);

            // Test 1
            assert.ok(response.data.includes("TLSv1.2 Authentication OK!"), "TLSv1.2 Authentication test failed!");

            // continue the intercepted request with the Axios response data
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

      await page.goto(TLS_TEST_URL);

      // Test 2
      const text = await pageHelper.getTextContent(page, "body > pre");
      assert.ok(
        text?.includes("[SSL_CLIENT_SERIAL] => 1F60DD0808D452BF4FD956509B970AF0"),
        "Client serial number test failed!"
      );

      // await pageHelper.sleep(3000000);
    } catch (error) {
      console.error("Test execution error:", error);
    } finally {
      if (page) {
        await page.close();
      }
      await browser.close();
    }
  });
});
