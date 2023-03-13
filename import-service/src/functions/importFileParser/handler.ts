import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import * as fastCsv from 'fast-csv'
import { EventBucketTrigger } from 'src/types/event';

const { UPLOAD_BUCKET, BUCKET_REGION } = process.env;

const importFileParser = async (event: EventBucketTrigger) => {
  console.log('importFileParser  Lambda triggered');
  if (event && event.Records) {
    const bareBonesS3 = new S3Client({
      region: BUCKET_REGION,
    });

    for (const record of event.Records) {
      console.log('importFileParser reading:', record.s3.object.key);
      const command =  new GetObjectCommand({
        Bucket: UPLOAD_BUCKET,
        Key: record.s3.object.key
      })

      const data: any = await (await bareBonesS3.send(command)).Body;
      if (!data) {
        console.log('importFileParser reading error:', record.s3.object.key);
      } else {
      fastCsv.parseStream(data)
        .on('data', (data) => {
          console.log(data)
        })
      }
    }
  }
};

export const main = importFileParser;
