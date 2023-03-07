import { checkIfOriginAllowed } from '@libs/api-gateway';
import { prepareResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { GetProductParams } from 'src/types/product';
import { RESP_STATUS_CODES } from 'src/utils/constants/codes';
import { EventGetAPIGatewayProxyEvent } from 'src/types/events';
import { productsDbDynamoAdapter } from 'src/dynamodb/product.adpt';

export const getProductById: EventGetAPIGatewayProxyEvent<GetProductParams> = async (event) => {
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

  console.log('Get product by id Lambda triggered');
  const { id } = event?.pathParameters ?? undefined;
  if (id) {
    const item = await productsDbDynamoAdapter.getProductById(id);
    if (item) {
      console.log('Get product: responding');
      return prepareResponse(RESP_STATUS_CODES.OK,
        requestOrigin,
        { message: 'MSG_PRODUCTS_FOUND', data: item }
      );
    } else {
      console.log('Get product: product not found');
      return prepareResponse(RESP_STATUS_CODES.NOT_FOUND,
        requestOrigin,
        { message: `Product with id - '${id}' not found` }
      );
    }
  } else {
    return prepareResponse(
      RESP_STATUS_CODES.BAD_REQUEST,
      requestOrigin,
      { message: `Bad Request` }
    );
  }
};

export const main = middyfy(getProductById);