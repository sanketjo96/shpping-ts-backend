import * as dotenv from 'dotenv';
import { v4 as uuidV4 } from 'uuid';
import { IProductsDBController } from "./types/product.adpt.types";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, ScanCommand, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { ProductData, Product, Stock, CreateProductBody } from 'src/types/product';
import { DEFAULT_ITEM_STOCK_COUNT } from 'src/utils/constants/app';

dotenv.config()
const { DB_REGION, DYNAMO_PRODUCTS_TABLE_NAME, DYNAMO_STOCKS_TABLE_NAME } = process.env;

const client = new DynamoDBClient({ region: DB_REGION });
const dbClient = DynamoDBDocument.from(client);

export const productsDbDynamoAdapter: IProductsDBController = {
    async getProductsList() {
        const { Items: dbProducts = [] } = await dbClient.send(
            new ScanCommand({
                TableName: DYNAMO_PRODUCTS_TABLE_NAME || '',
            })
        );

        const { Items: dbStocks = [] } = await dbClient.send(
            new ScanCommand({
                TableName: DYNAMO_STOCKS_TABLE_NAME || '',
            })
        );

        return <ProductData[]>dbProducts.map((product) => {
            const matchedProduct = dbStocks.find(({ product_id }) => product.id === product_id)
            return {
                ...product,
                count: matchedProduct?.count ?? 0,
            } as ProductData;
        });
    },
    async getProductById(productId: string) {
        const { Items: [dbproduct] } = await dbClient.send(
            new QueryCommand({
                TableName: DYNAMO_PRODUCTS_TABLE_NAME || '',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': productId },
            })
        );

        const { Items: [dbstock] } = await dbClient.send(
            new QueryCommand({
                TableName: DYNAMO_STOCKS_TABLE_NAME || '',
                KeyConditionExpression: 'product_id = :product_id',
                ExpressionAttributeValues: { ':product_id': productId },
            })
        );

        const product = dbproduct as Product;
        const stock = dbstock as Stock;
        if (!product || !stock) {
            return null;
        }

        return {
            ...product,
            count: stock?.count??0
        };
    },
    async createProduct (createProductBody: CreateProductBody) {
        const createProductId = uuidV4();

        const createProductData = {
            id: createProductId,
            ...createProductBody,
        };

        const createStockData = {
            count: DEFAULT_ITEM_STOCK_COUNT,
            product_id: createProductId,
        };

        await dbClient.send(
            new TransactWriteCommand({
                TransactItems: [
                    {
                        Put: {
                            TableName: DYNAMO_PRODUCTS_TABLE_NAME || '',
                            Item: createProductData,
                        }
                    },
                    {
                        Put: {
                            TableName: DYNAMO_STOCKS_TABLE_NAME || '',
                            Item: createStockData,
                        }
                    }
                ]

            })
        );

        return {
            product: createProductData,
            stock: createStockData,
        };
    }
}