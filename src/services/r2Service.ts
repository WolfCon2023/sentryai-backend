import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';

let s3Client: S3Client | null = null;
let bucketVerified = false;

function getClient(): S3Client {
  if (!s3Client) {
    const env = getEnv();
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

async function ensureBucket(): Promise<void> {
  if (bucketVerified) return;
  const env = getEnv();
  const client = getClient();
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET_NAME }));
  } catch {
    logger.info({ bucket: env.R2_BUCKET_NAME }, 'Bucket not found, creating...');
    await client.send(new CreateBucketCommand({ Bucket: env.R2_BUCKET_NAME }));
    logger.info({ bucket: env.R2_BUCKET_NAME }, 'Bucket created');
  }
  bucketVerified = true;
}

export const r2Service = {
  async uploadFile(
    dealId: string,
    _fileId: string,
    fileName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await ensureBucket();
    const env = getEnv();
    const key = `deals/${dealId}/${fileName}`;

    await getClient().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return key;
  },

  async downloadFile(r2Key: string): Promise<Buffer> {
    const env = getEnv();
    const response = await getClient().send(
      new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: r2Key,
      }),
    );

    const chunks: Uint8Array[] = [];
    const stream = response.Body as AsyncIterable<Uint8Array>;
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  },

  async deleteFile(r2Key: string): Promise<void> {
    const env = getEnv();
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: r2Key,
      }),
    );
  },

  async deleteDealFiles(dealId: string): Promise<void> {
    const env = getEnv();
    const prefix = `deals/${dealId}/`;

    const listed = await getClient().send(
      new ListObjectsV2Command({
        Bucket: env.R2_BUCKET_NAME,
        Prefix: prefix,
      }),
    );

    if (listed.Contents) {
      for (const obj of listed.Contents) {
        if (obj.Key) {
          await this.deleteFile(obj.Key);
        }
      }
    }
  },
};
