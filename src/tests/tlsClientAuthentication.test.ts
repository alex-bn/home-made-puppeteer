import { describe, it } from "node:test";
import HttpEngine from "../http-engine/HttpEngine";
import settings from "./_settings.json";
import assert from "assert";

describe("TLS Client Authentication Test", () => {
  it("TLSv1.2 Authentication OK", async () => {
    const http = new HttpEngine(settings.testUrls.tlsClientAuthentication, settings.certs["alex.test"], "1234");
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
});
