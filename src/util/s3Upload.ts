import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

/**
 * Converts a base64 Data URL to a Blob
 * @param dataurl
 * @returns
 */
function dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL: missing payload');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL: missing MIME type');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

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
 * @param path Optional custom folder path
 * @returns The public URL of the uploaded object
 */
export async function uploadToS3(dataUrl: string, fileName: string, bucket: string, region: string, identityPoolId: string, path: string = ''): Promise<string> {
    if (!identityPoolId || !bucket || !region) {
        return dataUrl; // fallback to data URL if no S3 config
    }

    const s3Client = new S3Client({
        region,
        credentials: fromCognitoIdentityPool({
            clientConfig: { region },
            identityPoolId,
        }),
        requestChecksumCalculation: 'WHEN_REQUIRED',
        forcePathStyle: true,
    });

    const blob = dataURLtoBlob(dataUrl);

    let basePath = path.trim();
    if (basePath && !basePath.endsWith('/')) {
        basePath += '/';
    }
    const key = basePath ? `${basePath}${fileName}` : `signatures/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: blob,
        ContentType: blob.type,
    });

    await s3Client.send(command);

    // forcePathStyle: true → https://s3.<region>.amazonaws.com/<bucket>/<key>
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    return `https://s3.${region}.amazonaws.com/${bucket}/${encodedKey}`;
}
