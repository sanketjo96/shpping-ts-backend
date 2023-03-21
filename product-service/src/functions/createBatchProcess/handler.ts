import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

import { productsDbDynamoAdapter } from "src/dynamodb/product.adpt";
import { CreateProductBody } from "src/types/product";

const { SNS_REGION, SNS_TOPIC_ARN } = process.env;

export const createBatchProcess = async (event: SQSEvent) => {
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

    const snsClient = new SNSClient({ region: SNS_REGION });
    const command = new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Subject: "Products added successfully",
      Message: `${productRecords.length} Products added`,
      MessageAttributes: {
        less_products: {
          DataType: "String",
          StringValue: productRecords.length < 2 ? 'true' : 'false'
        }
      }
    });
    const response = await snsClient.send(command);
    console.log('Sent email notification', response);
  } catch (e) {
    console.log(e)
  }
}

export const main = createBatchProcess;