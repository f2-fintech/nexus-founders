import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Client() {
  const region = process.env.AWS_REGION || "eu-north-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME) are not configured in environment variables."
    );
  }

  return {
    client: new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
    region,
    bucketName,
  };
}

export async function uploadBufferToS3(
  buffer: Buffer,
  folder: string,
  fileName: string,
  contentType: string = "image/webp"
): Promise<string> {
  const { client, region, bucketName } = getS3Client();
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const key = `${cleanFolder}/${Date.now()}_${fileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await client.send(new PutObjectCommand(params));
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
