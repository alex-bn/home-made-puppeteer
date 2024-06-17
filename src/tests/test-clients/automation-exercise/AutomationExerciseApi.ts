import HttpEngine from "../../../http-engine/HttpEngine";
import {
  ApiResponse,
  ProductsList,
  BrandsList,
  VerifyLogin,
  CreateAccountParams,
  CreateAccount,
  DeleteAccount,
} from "./interfaces";
import settings from "../../_settings.json";
import { AxiosRequestConfig } from "axios";
import FormData from "form-data";

class AutomationExerciseApi {
  private http: HttpEngine;
  constructor(http: HttpEngine) {
    this.http = http;
  }

  async makeGeneralRequest(axiosRequestConfig: AxiosRequestConfig): Promise<ApiResponse<any>> {
    return this.http.request(axiosRequestConfig);
  }

  async productList(): Promise<ApiResponse<ProductsList>> {
    return this.http.get("/productsList");
  }

  async brandsList(): Promise<ApiResponse<BrandsList>> {
    return this.http.get("/brandsList");
  }

  async searchProduct(search_product: string | null): Promise<ApiResponse<ProductsList>> {
    const form = new FormData();

    if (search_product) {
      form.append("search_product", search_product);
    }

    return this.http.request({
      url: "/searchProduct",
      method: "POST",
      data: form,
    });
  }

  async verifyLogin(email?: string | null, password?: string): Promise<ApiResponse<VerifyLogin>> {
    const form = new FormData();

    if (email) {
      form.append("email", email);
    }
    if (password) {
      form.append("password", password);
    }

    return await this.http.request({
      url: "/verifyLogin",
      method: "POST",
      data: form,
    });
  }

  async createAccount(params: CreateAccountParams): Promise<ApiResponse<CreateAccount>> {
    const formData = new FormData();

    formData.append("name", params.name);
    formData.append("email", params.email);
    formData.append("password", params.password);
    formData.append("title", params.title);
    formData.append("birth_date", params.birth_date);
    formData.append("birth_month", params.birth_month);
    formData.append("birth_year", params.birth_year);
    formData.append("firstname", params.firstname);
    formData.append("lastname", params.lastname);
    formData.append("address1", params.address1);
    formData.append("country", params.country);
    formData.append("zipcode", params.zipcode);
    formData.append("state", params.state);
    formData.append("city", params.city);
    formData.append("mobile_number", params.mobile_number);

    if (params.company) {
      formData.append("company", params.company);
    }
    if (params.address2) {
      formData.append("address2", params.address2);
    }

    const response = await this.http.request({
      url: "/createAccount",
      method: "POST",
      data: formData,
    });
    return response;
  }

  async deleteAccount(email?: string | null, password?: string): Promise<ApiResponse<DeleteAccount>> {
    const form = new FormData();

    if (email) {
      form.append("email", email);
    }
    if (password) {
      form.append("password", password);
    }

    return await this.http.request({
      url: "/deleteAccount",
      method: "DELETE",
      data: form,
    });
  }

  async updateAccount(params: CreateAccountParams): Promise<ApiResponse<CreateAccount>> {
    const formData = new FormData();

    formData.append("name", params.name);
    formData.append("email", params.email);
    formData.append("password", params.password);
    formData.append("title", params.title);
    formData.append("birth_date", params.birth_date);
    formData.append("birth_month", params.birth_month);
    formData.append("birth_year", params.birth_year);
    formData.append("firstname", params.firstname);
    formData.append("lastname", params.lastname);
    formData.append("address1", params.address1);
    formData.append("country", params.country);
    formData.append("zipcode", params.zipcode);
    formData.append("state", params.state);
    formData.append("city", params.city);
    formData.append("mobile_number", params.mobile_number);

    if (params.company) {
      formData.append("company", params.company);
    }
    if (params.address2) {
      formData.append("address2", params.address2);
    }

    const response = await this.http.request({
      url: "/updateAccount",
      method: "PUT",
      data: formData,
    });
    return response;
  }

  async getUserDetailByEmail(email: string): Promise<ApiResponse<any>> {
    const form = new FormData();

    form.append("email", email);

    return await this.http.request({
      url: "/getUserDetailByEmail",
      method: "GET",
      data: form,
    });
  }
}

const httpEngine = new HttpEngine(settings.testUrls.automationExercise.url);
const automationExerciseApi = new AutomationExerciseApi(httpEngine);
export default automationExerciseApi;
