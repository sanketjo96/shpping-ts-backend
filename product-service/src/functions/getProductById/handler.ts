import { checkIfOriginAllowed } from '@libs/api-gateway';
import { prepareResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { Product, GetProductParams } from 'src/types/product';
import PRODUCT_LIST from "src/mocks/products.json";
import { RESP_STATUS_CODES } from 'src/utils/constants/codes';
import { EventGetAPIGatewayProxyEvent } from 'src/types/events';

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

  const { id } = event?.pathParameters ?? undefined;
  if (id) {
    const item = PRODUCT_LIST.find((product: Product) => product.id === id);
    if (item) {
      return prepareResponse(RESP_STATUS_CODES.OK,
        requestOrigin,
        { message: 'MSG_PRODUCTS_FOUND', data: item }
      );
    } else {
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