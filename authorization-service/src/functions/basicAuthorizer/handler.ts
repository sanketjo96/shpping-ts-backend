import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { Effect, generateResponse } from 'src/utils';

const { sanketjoshi96 } = process.env;

const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEvent) => {
  console.log('Auth handler triggered');

  const { headers, methodArn } = event;
  const principalId = 'sanketjoshi96';

  const response = headers.Authorization === sanketjoshi96
    ? generateResponse(principalId, Effect.Allow, methodArn)
    : generateResponse(principalId, Effect.Deny, methodArn)

  return response;
};

export const main = basicAuthorizer;
