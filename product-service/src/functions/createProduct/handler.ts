import { prepareResponse } from '@libs/api-gateway';
import { checkIfOriginAllowed } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { EventGetAPIGatewayProxyEvent } from 'src/types/events';
import { RESP_STATUS_CODES } from 'src/utils/constants/codes';
import { productsDbDynamoAdapter } from 'src/dynamodb/product.adpt';
import { isValidCreateProductBody } from './validate';
import { BadRequestError, BaseError } from '@libs/errors';
import { ERR_MSGS, SUCCESS_MSG } from 'src/utils/constants/messages';

const createProduct: EventGetAPIGatewayProxyEvent = async (event) => {
  const requestOrigin = event.headers.origin || '';
  const createProductBody = event?.body ?? []

  try {
    if (!checkIfOriginAllowed(requestOrigin)) {
      return prepareResponse(
        RESP_STATUS_CODES.FORBIDDEN,
        '',
        {
          message: 'Not allowed',
        },
      );
    }

    console.log('Create product Lambda triggered, body params: ', event?.body);

    if (!isValidCreateProductBody(createProductBody)) {
      throw new BadRequestError(ERR_MSGS.MSG_INVALID_PRODUCT_DATA);
    }

    const createdData = await productsDbDynamoAdapter.createProduct(createProductBody);
    return prepareResponse(
      RESP_STATUS_CODES.CREATED,
      requestOrigin,
      {
        message: SUCCESS_MSG.MSG_PRODUCT_CREATED,
        data: createdData,
      },
    );
  } catch (error) {
    console.error('Create product request error', error);
    if (error instanceof BaseError) {
        const { code, stack, message } = error;
        return prepareResponse(code, requestOrigin, { stack, message });
    } else if (error instanceof Error) {
        const { message, stack } = error;
        return prepareResponse(RESP_STATUS_CODES.INTERNAL_ERROR, requestOrigin, { stack, message });
    }
    return prepareResponse(RESP_STATUS_CODES.INTERNAL_ERROR, requestOrigin, { message: ERR_MSGS.SOMETHING_IS_WRONG });
  }
};

export const main = middyfy(createProduct);
