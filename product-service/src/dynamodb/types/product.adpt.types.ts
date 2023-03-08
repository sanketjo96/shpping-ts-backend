import { CreateProductBody, Product, ProductData, Stock } from "src/types/product";

export interface IProductsDBController {
    getProductsList: () => Promise<ProductData[]>;
    getProductById: (productId: string) => Promise<any | null>;
    createProduct: (productData: CreateProductBody) => Promise<{
        product: Product; 
        stock: Stock;
    }>
}