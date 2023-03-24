import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { Effect, generateResponse } from 'src/utils';

const { AUTH_USERNAME, AUTH_PASSWORD } = process.env;

const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEvent, ctx, callback) => {
  console.log('Auth handler triggered');

  const { headers, methodArn } = event;
  const authorizationHeader = headers.Authorization;
  if (!authorizationHeader) {
    return callback("Unauthorized");
  }

  console.log('authorizationHeader', authorizationHeader)
  const encodedCreds = authorizationHeader.split(" ")[1];

  if (!encodedCreds) {
    return callback("Unauthorized");
  }

  const [username, password] = Buffer.from(encodedCreds, "base64")
    .toString()
    .split(":");

  console.log('Decode', username, password)
  let response = {}
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    response = generateResponse(username, Effect.Allow, methodArn);
  } else {
    response = generateResponse(username, Effect.Deny, methodArn)
  }

  return response;
};

export const main = basicAuthorizer;
