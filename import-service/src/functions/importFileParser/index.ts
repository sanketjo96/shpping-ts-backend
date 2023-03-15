import { handlerPath } from '@libs/handler-resolver';
// const { UPLOAD_BUCKET } = process.env;

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            s3: {
                bucket: 's3-aws-js-upload',
                event: 's3:ObjectCreated:*',
                rules: [{
                    prefix: 'upload/',
                }],
                existing: true
            },
        },
    ],
};
