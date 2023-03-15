import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import csvParser from 'csv-parser';
import { EventBucketTrigger } from 'src/types/event';
import { RESP_STATUS_CODES } from "src/utils/constants/codes";
import { ERR_MSGS } from "src/utils/constants/messages";
import { Readable } from "stream";

const { UPLOAD_BUCKET, BUCKET_REGION } = process.env;

const _copyAndDelete = async (client, record) => {
  const copyCmd = new CopyObjectCommand({
    Bucket: UPLOAD_BUCKET,
    CopySource: `${UPLOAD_BUCKET}/${record.s3.object.key}`,
    Key: record.s3.object.key.replace('upload', 'parsed')
  })
  await client.send(copyCmd);
  console.log('importFileParser moved csv to parsed location');

  const deleteCmd = new DeleteObjectCommand({
    Bucket: UPLOAD_BUCKET,
    Key: record.s3.object.key
  })
  await client.send(deleteCmd);
  console.log('importFileParser deleted from uploaded location');
}

const importFileParser = async (event: EventBucketTrigger) => {
  try {
    const records = event.Records;
    const recordsLength = records.length;
    console.log('Import file parser lambda was triggered with records: ', records);

    if (recordsLength === 0) {
      throw new Error();
    }

    const s3Client = new S3Client({
      region: BUCKET_REGION,
    });

    const recordPromises = records.map(async (record, recordIndex) => {
      const RECORD_INFO = `[RECORD ${recordIndex + 1} of ${recordsLength}]`;
      const s3StreamBody = (
        await s3Client.send(
          new GetObjectCommand({
            Bucket: UPLOAD_BUCKET,
            Key: record.s3.object.key
          })
        )
      ).Body;

      if (!(s3StreamBody instanceof Readable)) {
        throw new Error(`${RECORD_INFO} ${ERR_MSGS.MSG_ERROR_DURING_READ_STREAM}`);
      }

      return new Promise((resolve, reject) => {
        s3StreamBody
          .pipe(csvParser())
          .on('data', (data) => {
            console.log(RECORD_INFO, `Parsing product import CSV data: `, data);
          })
          .on('error', (error) => {
            console.error(RECORD_INFO, `Parsing error for product import CSV data: `, error);
            reject(new Error(`${RECORD_INFO} ${ERR_MSGS.MSG_ERROR_DURING_READ_STREAM}`));
          })
          .on('end', async () => {
            console.log(
              RECORD_INFO,
              `Product data parsed. Moving to "/parsed" folder has started.`
            );
            await _copyAndDelete(s3Client, record);

            console.log(RECORD_INFO, 'Uploaded record deleted successfully!');
            resolve('ok')
          });

      })
    })

    await Promise.all(recordPromises);
    return {
      statusCode: RESP_STATUS_CODES.ACCEPTED,
    };
  } catch (e) {
    return {
      messages: 'Internal server error.',
      err: e,
      statusCode: RESP_STATUS_CODES.INTERNAL_ERROR,
    };
  }
};

export const main = importFileParser;
