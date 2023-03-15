import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler, S3Event } from 'aws-lambda';

export type GetForGetewayEvent<P = void, Q = void> = Omit<
    APIGatewayProxyEvent,
    'pathParameters' | 'queryStringParameters'
> & { pathParameters?: P; queryStringParameters?: Q };

export type EventGetAPIGatewayProxyEvent<P = void, Q = void> = Handler<
    GetForGetewayEvent<P, Q>,
    APIGatewayProxyResult
>;

export type EventBucketTrigger = S3Event;