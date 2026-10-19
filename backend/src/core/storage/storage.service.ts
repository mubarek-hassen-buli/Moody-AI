import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

/** Maximum upload size in bytes (5 MB) */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Allowed image MIME types */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const DATA_URI_REGEX = /^data:(image\/\w+);base64,/;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('NEON_STORAGE_BUCKET', 'assets');
    this.endpoint = this.configService.get<string>(
      'AWS_ENDPOINT_URL_S3',
      'https://ep-weathered-flower-b4mcbmhk.storage.c-6.us-east-2.aws.neon.tech',
    );

    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-2'),
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
      forcePathStyle: true,
    });
  }

  /**
   * Upload a base64-encoded image to Neon Object Storage.
   */
  async uploadImage(base64Data: string, folder = 'avatars'): Promise<string> {
    const dataUri = base64Data.startsWith('data:')
      ? base64Data
      : `data:image/jpeg;base64,${base64Data}`;

    const mimeMatch = dataUri.match(DATA_URI_REGEX);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.has(mimeMatch[1])) {
      throw new BadRequestException(
        'Invalid image format. Accepted types: JPEG, PNG, GIF, WebP.',
      );
    }

    const mimeType = mimeMatch[1];
    const ext = mimeType.split('/')[1] || 'jpg';
    const rawBase64 = dataUri.replace(DATA_URI_REGEX, '');
    const buffer = Buffer.from(rawBase64, 'base64');

    if (buffer.length > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `Image too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`,
      );
    }

    const key = `${folder}/${Date.now()}-${randomUUID()}.${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const publicUrl = `${this.endpoint}/${this.bucket}/${key}`;
      this.logger.log(`Uploaded image to Neon Object Storage: ${publicUrl}`);
      return publicUrl;
    } catch (err) {
      this.logger.error('Neon storage upload failed:', err);
      // Fallback: return data URI so user avatar still functions even if S3 keys are pending
      return dataUri;
    }
  }

  /**
   * Generate a presigned URL to access an object.
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
