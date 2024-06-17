import { Product, Brand, CreateAccountParams } from "./interfaces";
import crypto from "crypto";

export default class Helpers {
  isProduct(item: any): item is Product {
    return (
      typeof item.id === "number" &&
      typeof item.name === "string" &&
      typeof item.price === "string" &&
      typeof item.brand === "string" &&
      item.category &&
      typeof item.category.usertype.usertype === "string" &&
      typeof item.category.category === "string"
    );
  }

  isBrand(item: any): item is Brand {
    return typeof item.id === "number" && typeof item.brand === "string";
  }

  getEmail() {
    let min = 1;
    let max = 1000000;
    const range = max - min + 1;

    min = Math.ceil(min);
    max = Math.ceil(max);

    const randomBytes = crypto.randomBytes(4);
    const randomInt = randomBytes.readUInt32LE(0);

    const randomNumber = min + Math.floor(randomInt / (0xffffffff / range));

    return `user${randomNumber}@yopmail.com`;
  }

  getEnrollData(): CreateAccountParams {
    return {
      name: "string",
      email: this.getEmail(),
      password: "1234",
      title: "Mr",
      birth_date: "string",
      birth_month: "string",
      birth_year: "string",
      firstname: "string",
      lastname: "string",
      company: "string",
      address1: "string",
      address2: "string",
      country: "string",
      zipcode: "string",
      state: "string",
      city: "string",
      mobile_number: "string",
    };
  }
}
