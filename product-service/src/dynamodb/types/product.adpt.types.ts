import { ProductData } from "src/types/product";

export interface IProductsDBController {
    getProductsList: () => Promise<ProductData[]>;
    getProductById: (productId: string) => Promise<any | null>;
}