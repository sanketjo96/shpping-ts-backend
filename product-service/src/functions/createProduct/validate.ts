import { CreateProductBody } from "src/types/product";

export const isValidCreateProductBody = (data: any): data is CreateProductBody => {
    const { title, description, price } = data;

    return (
        typeof title === 'string' &&
        typeof description === 'string' &&
        Number.isFinite(price)
    );
};