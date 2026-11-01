import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "ap-southeast-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "web-service-tracker-uploads";

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  ...(process.env.AWS_ENDPOINT ? { endpoint: process.env.AWS_ENDPOINT } : {}),
});

/**
 * Generate a presigned PUT URL for uploading evidence photos (damage / resolved proof)
 * @param fileName Original or sanitized filename
 * @param fileType MIME type (e.g. image/jpeg, image/png)
 * @param folder Subfolder path in the bucket (e.g. "damages" | "resolutions")
 * @returns { uploadUrl: string, fileKey: string, publicUrl: string }
 */
export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: "damages" | "resolutions" = "damages"
) {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileKey = `${folder}/${timestamp}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  // URL valid for 15 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  // If using Cloudflare R2 or custom endpoint, format accordingly, otherwise standard S3 URL
  const publicUrl = process.env.AWS_ENDPOINT
    ? `${process.env.AWS_ENDPOINT}/${BUCKET_NAME}/${fileKey}`
    : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${fileKey}`;

  return {
    uploadUrl,
    fileKey,
    publicUrl,
  };
}

/**
 * Generate a temporary read URL for private S3 objects if required
 */
export async function getPresignedReadUrl(fileKey: string, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
