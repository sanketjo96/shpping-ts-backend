import { SQSEvent } from "aws-lambda";
import { productsDbDynamoAdapter } from "src/dynamodb/product.adpt";
import { CreateProductBody } from "src/types/product";

const createBatchProcess = async (event: SQSEvent) => {
  console.log('createBatchProcess triggered');

  try {
    const records = event.Records;
    const recordsLength = records.length;

    console.log('createBatchProcess records', records);
    if (recordsLength === 0) {
      throw new Error();
    }

    const productRecords: CreateProductBody[] = records.map((record) => ({
      ...JSON.parse(record.body),
    }));

    console.log(productRecords)
    await productsDbDynamoAdapter.createProducts(productRecords);
    console.log('createBatchProcess completed');
  } catch (e) {
    console.log(e)
  }
}

export const main = createBatchProcess;