import { ALLOWED_REQUEST_ORIGINS } from "src/utils/config/origins";

export const prepareResponse = (statusCode: number, requestOrigin: string, response: Record<string, unknown>) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  },
    body: JSON.stringify(response)
  }
}

export const checkIfOriginAllowed = (requestOrigin: string) => {
  return ALLOWED_REQUEST_ORIGINS.indexOf(requestOrigin) > -1;
};