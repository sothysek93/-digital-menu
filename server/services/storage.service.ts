import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

export class StorageService {
  static async getUploadUrl(restaurantId: string, fileName: string) {
    const key = `menus/${restaurantId}/${fileName}`;
    return s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.R2_BUCKET_NAME as string,
      Key: key,
      Expires: 3600,
    });
  }

  static async uploadDirect(restaurantId: string, fileName: string, buffer: Buffer) {
    const key = `menus/${restaurantId}/${fileName}`;
    return s3.putObject({
      Bucket: process.env.R2_BUCKET_NAME as string,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
    }).promise();
  }
}
