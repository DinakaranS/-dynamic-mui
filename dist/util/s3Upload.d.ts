/**
 * Uploads a base64 encoded image to AWS S3.
 * IMPORTANT: This requires valid AWS credentials in your environment variables.
 * In a real production app without backend presigned URLs, consider restricted IAM roles.
 *
 * @param dataUrl The base64 data URL from the signature canvas
 * @param fileName The desired filename (without path)
 * @param bucket S3 Bucket name from attributes
 * @param region AWS Region from attributes
 * @param identityPoolId AWS Cognito Identity Pool ID
 * @returns The public URL of the uploaded object
 */
export declare function uploadToS3(dataUrl: string, fileName: string, bucket: string, region: string, identityPoolId: string): Promise<string>;
