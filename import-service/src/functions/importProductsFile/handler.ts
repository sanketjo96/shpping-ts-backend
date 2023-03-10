import { checkIfOriginAllowed, prepareResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { EventGetAPIGatewayProxyEvent } from 'src/types/event';
import { ImportFileQueryStringParams } from 'src/types/productFile';
import { RESP_STATUS_CODES } from 'src/utils/constants/codes';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { UPLOAD_BUCKET, BUCKET_REGION } = process.env;

const importProductsFile: EventGetAPIGatewayProxyEvent<void, ImportFileQueryStringParams> = async (event) => {
  const requestOrigin = event.headers.origin || '';

  if (!checkIfOriginAllowed(requestOrigin)) {
    return prepareResponse(
      RESP_STATUS_CODES.FORBIDDEN,
      '',
      {
        message: 'Not allowed',
      },
    );
  }

  console.log('importProductsFile Lambda triggered');
  const { queryStringParameters } = event || {};
  if (queryStringParameters && queryStringParameters.fileName) {
    const { fileName } = queryStringParameters
    const bareBonesS3 = new S3Client({
      region: BUCKET_REGION,
    });

    const command = new PutObjectCommand({
      Bucket: UPLOAD_BUCKET,
      Key: `upload/${fileName}`,
      ContentType: 'text/csv'
    })

    const url = await getSignedUrl(bareBonesS3, command, { expiresIn: 3600 })
    return prepareResponse(RESP_STATUS_CODES.OK,
      requestOrigin,
      {
        message: `${fileName}`,
        url
      }
    );
  } else {
    return prepareResponse(
      RESP_STATUS_CODES.BAD_REQUEST,
      requestOrigin,
      { message: `Bad Request` }
    );
  }
};

export const main = middyfy(importProductsFile);
