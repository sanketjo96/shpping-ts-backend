export type GetProductParams = {
  id: string;
};

export interface Product {
  description: string;
  id: string;
  price: number;
  title: string;
}

export type Products = Product[];

export type Error = {
  message: string
}