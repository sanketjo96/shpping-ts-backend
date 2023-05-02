import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        cors: true,
        request: {
          parameters: {
            querystrings: {
              fileName: true
            }
          }
        },
        authorizer: {
          arn: 'arn:aws:lambda:us-east-1:108404791142:function:authorization-service-dev-basicAuthorizer',
          type: 'request'
        }
      },
    },
  ],
};
