import assert from "node:assert";
import { describe, it, before } from "node:test";
import automationExerciseApi from "./test-clients/automation-exercise/AutomationExerciseApi";
import Helpers from "./test-clients/automation-exercise/Helpers";
import settings from "./_settings.json";

describe("automationExercise - API tests scenarios", () => {
  let helpers: Helpers;
  before(async () => {
    helpers = new Helpers();
  });

  it("API 1: Get All Products List", async () => {
    //
    const getProductsResponse = await automationExerciseApi.productList();
    // api & request status codes
    assert.equal(getProductsResponse.status, 200);
    assert.equal(getProductsResponse.data.responseCode, 200);
    // verify data types
    getProductsResponse.data.products.forEach((product) => {
      assert.ok(helpers.isProduct(product), "Test failed!");
    });
  });

  it("API 2: POST To All Products List", async () => {
    // fire request
    const postToAllProductsListResponse = await automationExerciseApi.makeGeneralRequest({
      url: "/productsList",
      method: "POST",
    });

    // request status
    assert.equal(postToAllProductsListResponse.status, 200);
    // api status
    assert.equal(postToAllProductsListResponse.data.responseCode, 405);
    // api error message
    assert.equal(postToAllProductsListResponse.data.message, "This request method is not supported.");
  });

  it("API 3: Get All Brands List", async () => {
    // fire request
    const brandsListResponse = await automationExerciseApi.brandsList();
    // statuses
    assert.equal(brandsListResponse.status, 200);
    assert.equal(brandsListResponse.data.responseCode, 200);
    // data
    brandsListResponse.data.brands.forEach((item) => {
      assert.ok(helpers.isBrand(item), "Test failed!");
    });
  });

  it("API 4: PUT To All Brands List", async () => {
    //
    const postToAllProductsListResponse = await automationExerciseApi.makeGeneralRequest({
      url: "/brandsList",
      method: "PUT",
    });
    //
    assert.equal(postToAllProductsListResponse.status, 200);
    assert.equal(postToAllProductsListResponse.data.responseCode, 405);
    assert.equal(postToAllProductsListResponse.data.message, "This request method is not supported.");
  });

  it("API 5: POST To Search Product", async () => {
    const productList = ["top", "tshirt", "jean"];

    for (const product of productList) {
      const searchProductResult = await automationExerciseApi.searchProduct(product);

      assert.equal(searchProductResult.status, 200);
      assert.equal(searchProductResult.data.responseCode, 200);

      searchProductResult.data.products.forEach((item) => {
        assert.ok(helpers.isProduct(item), "Test failed");
      });
    }
  });

  it("API 6: POST To Search Product without search_product parameter", async () => {
    //
    const searchProductResult = await automationExerciseApi.searchProduct(null);
    //
    assert.equal(searchProductResult.status, 200);
    assert.equal(searchProductResult.data.responseCode, 400);
    assert.equal(searchProductResult.data.message, "Bad request, search_product parameter is missing in POST request.");
  });

  it("API 7: POST To Verify Login with valid details", async () => {
    //
    const verifyLoginResponse = await automationExerciseApi.verifyLogin(
      settings.testUrls.automationExercise.email,
      settings.testUrls.automationExercise.password
    );
    //
    assert.equal(verifyLoginResponse.status, 200);
    assert.equal(verifyLoginResponse.data.responseCode, 200);
    assert.equal(verifyLoginResponse.data.message, "User exists!");
  });

  it("API 8: POST To Verify Login without email parameter", async () => {
    //
    const verifyLoginResponse = await automationExerciseApi.verifyLogin(
      null,
      settings.testUrls.automationExercise.password
    );
    //
    assert.equal(verifyLoginResponse.status, 200);
    assert.equal(verifyLoginResponse.data.responseCode, 400);
    assert.equal(
      verifyLoginResponse.data.message,
      "Bad request, email or password parameter is missing in POST request."
    );
  });

  it("API 9: DELETE To Verify Login", async () => {
    //
    const postToAllProductsListResponse = await automationExerciseApi.makeGeneralRequest({
      url: "/verifyLogin",
      method: "DELETE",
      data: {
        email: settings.testUrls.automationExercise.email,
        password: settings.testUrls.automationExercise.password,
      },
    });
    //
    assert.equal(postToAllProductsListResponse.status, 200);
    assert.equal(postToAllProductsListResponse.data.responseCode, 405);
    assert.equal(postToAllProductsListResponse.data.message, "This request method is not supported.");
  });

  it("API 10: POST To Verify Login with invalid details", async () => {
    //
    const verifyLoginResponse = await automationExerciseApi.verifyLogin("invalidEmail", "invalidPasswd");
    //
    assert.equal(verifyLoginResponse.status, 200);
    assert.equal(verifyLoginResponse.data.responseCode, 404);
    assert.equal(verifyLoginResponse.data.message, "User not found!");
  });

  it("API 11: POST To Create/Register User Account", async () => {
    //
    const userData = helpers.getEnrollData();
    const createUserResponse = await automationExerciseApi.createAccount(userData);
    //
    assert.equal(createUserResponse.status, 200);
    assert.equal(createUserResponse.data.responseCode, 201);
    assert.equal(createUserResponse.data.message, "User created!");
  });

  it("API 12: DELETE METHOD To Delete User Account", async () => {
    //
    const userData = helpers.getEnrollData();
    await automationExerciseApi.createAccount(userData);
    //
    const deleteUserResponse = await automationExerciseApi.deleteAccount(userData.email, userData.password);
    //
    assert.equal(deleteUserResponse.status, 200);
    assert.equal(deleteUserResponse.data.responseCode, 200);
    assert.equal(deleteUserResponse.data.message, "Account deleted!");
  });

  it("API 13: PUT METHOD To Update User Account", async () => {
    //
    const userData = helpers.getEnrollData();
    await automationExerciseApi.createAccount(userData);
    //
    const updateUserData = helpers.getEnrollData();
    updateUserData.email = userData.email;
    const updateUserResponse = await automationExerciseApi.updateAccount(updateUserData);
    //
    assert.equal(updateUserResponse.status, 200);
    assert.equal(updateUserResponse.data.responseCode, 200);
    assert.equal(updateUserResponse.data.message, "User updated!");
  });

  it("API 14: GET user account detail by email", async () => {
    const userData = helpers.getEnrollData();
    await automationExerciseApi.createAccount(userData);
    // can'd seem to make this one work...
    const getUserDetailsResponse = await automationExerciseApi.getUserDetailByEmail(userData.email);
    assert.equal(getUserDetailsResponse.status, 200);
    assert.equal(getUserDetailsResponse.data.responseCode, 400);
    assert.equal(getUserDetailsResponse.data.message, "Bad request, email parameter is missing in GET request.");
  });
});
