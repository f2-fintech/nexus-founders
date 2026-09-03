import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "eu-north-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "AKIA6ODU4552YNVUD37N";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "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";
const bucketName = process.env.AWS_BUCKET_NAME || "f2fintechcustomerdocs";

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadBufferToS3(
  buffer: Buffer,
  folder: string,
  fileName: string,
  contentType: string = "image/webp"
): Promise<string> {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const key = `${cleanFolder}/${Date.now()}_${fileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
