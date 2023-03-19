import type { AWS } from '@serverless/typescript';

import getProducts from '@functions/getProducts';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';
import createBatchProcess from '@functions/createBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DB_REGION: 'us-east-1',
      SQS_QUEUE_URL: { Ref: "catalogItemsQueue" },
      DYNAMO_PRODUCTS_TABLE_NAME: 'products',
      DYNAMO_STOCKS_TABLE_NAME: 'stocks'
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['dynamodb:*'],
            Resource: [
              'arn:aws:dynamodb:us-east-1:108404791142:table/products',
              'arn:aws:dynamodb:us-east-1:108404791142:table/stocks'
            ]
          },
          {
            Effect: "Allow",
            Action: "sqs:*",
            Resource: { "Fn::GetAtt": ["catalogItemsQueue", "Arn"] },
          },
        ]
      }
    }
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      }
    }
  },
  // import the function via paths
  functions: { getProducts, getProductById, createProduct, createBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
