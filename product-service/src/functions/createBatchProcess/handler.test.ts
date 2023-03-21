import { expect, jest, test, beforeAll, afterAll, describe } from '@jest/globals';
import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda";
import { createBatchProcess } from './handler';
import { productsDbDynamoAdapter } from "src/dynamodb/product.adpt";

jest.mock('src/dynamodb/product.adpt', () => ({
  productsDbDynamoAdapter: {
    createProducts: jest.fn(() => 'MV1')
  }
}));

const mockEvent = {
  Records: [
    {
      messageId: "1",
      body: JSON.stringify({
        title: "title1",
        description: "description1",
        price: 1,
        count: 1,
      }),
    },
    {
      messageId: "2",
      body: JSON.stringify({
        title: "title2",
        description: "description2",
        price: 2,
        count: 2,
      }),
    },
  ],
};

const env = process.env;

beforeAll((done) => {
  process.env = { ...env, SNS_ARN: "arn::123" };
  done();
});

afterAll(() => {
  process.env = env;
});

describe("catalogBatchProcess", () => {
  test("should push items from SQS to SNS", async () => {
    const adpt = productsDbDynamoAdapter;
  
    const mockPublishToSNS = jest.fn().mockImplementation((_) => {
      console.log("SNS", "tranpublishsactWrite", "mock called");
    });
    const mockTransactWrite = jest.fn().mockImplementation((_) => {
      console.log("DynamoDB.DocumentClient", "transactWrite", "mock called");
    });
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "transactWrite", mockTransactWrite);
    AWSMock.mock("SNS", "publish", mockPublishToSNS);

    await createBatchProcess(mockEvent as unknown as SQSEvent);

    expect(mockTransactWrite).toBeCalled();
    expect(mockPublishToSNS).toBeCalled();
  });
});