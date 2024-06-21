export type ApiResponse<D> = {
  status: number;
  data: D;
};

export type ApiError = {
  status: number;
  data: any;
};

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: Category;
}

interface Category {
  usertype: {
    usertype: string;
  };
  category: string;
}

export interface ProductsList {
  responseCode: number;
  products: Product[];
  message?: string;
}

export interface Brand {
  id: number;
  brand: string;
}

export interface BrandsList {
  responseCode: number;
  brands: Brand[];
}

export interface VerifyLogin {
  responseCode: number;
  message: string;
}

export interface CreateAccountParams {
  name: string;
  email: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company?: string;
  address1: string;
  address2?: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

export interface CreateAccount {
  responseCode: number;
  message: string;
}

export interface DeleteAccount {
  responseCode: number;
  message: string;
}
