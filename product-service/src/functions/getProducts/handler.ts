import { prepareResponse } from '@libs/api-gateway';
import { checkIfOriginAllowed } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { EventGetAPIGatewayProxyEvent } from 'src/types/events';
import { RESP_STATUS_CODES } from 'src/utils/constants/codes';
import { productsDbDynamoAdapter } from 'src/dynamodb/product.adpt';

const getProducts: EventGetAPIGatewayProxyEvent = async (event) => {
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

  console.log('Get products Lambda triggered');
  const resultData = await productsDbDynamoAdapter.getProductsList();
  return prepareResponse(RESP_STATUS_CODES.OK,
    requestOrigin,
    {
      message: 'MSG_PRODUCTS_FOUND',
      data: resultData,
    },
  );
};

export const main = middyfy(getProducts);
