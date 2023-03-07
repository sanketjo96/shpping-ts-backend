export type GetProductParams = {
  id: string;
};

export interface Product {
  description: string;
  id: string;
  price: number;
  title: string;
}

export interface Stock {
  product_id: string;
  count: number;
}

export type Products = Product[];

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export type Error = {
  message: string
}