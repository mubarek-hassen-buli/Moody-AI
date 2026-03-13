import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Maximum upload size in bytes (5 MB) */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Allowed image MIME types */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

/** Regex to extract the MIME type from a data-URI prefix */
const DATA_URI_REGEX = /^data:(image\/\w+);base64,/;

/* ──────────────────────────────────────────────────────────
 * Service
 * ────────────────────────────────────────────────────────── */

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload a base64-encoded image to Cloudinary.
   *
   * Validates the payload before uploading:
   *  - Must be a recognised image MIME type (jpeg, png, gif, webp)
   *  - Must not exceed 5 MB after decoding
   *
   * Returns the secure URL of the uploaded image.
   */
  async uploadImage(
    base64Data: string,
    folder = 'moody/avatars',
  ): Promise<string> {
    /* ── Build data URI if missing ──────────────────────── */
    const dataUri = base64Data.startsWith('data:')
      ? base64Data
      : `data:image/jpeg;base64,${base64Data}`;

    /* ── Validate MIME type ─────────────────────────────── */
    const mimeMatch = dataUri.match(DATA_URI_REGEX);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.has(mimeMatch[1])) {
      throw new BadRequestException(
        'Invalid image format. Accepted types: JPEG, PNG, GIF, WebP.',
      );
    }

    /* ── Validate decoded size ──────────────────────────── */
    const rawBase64 = dataUri.replace(DATA_URI_REGEX, '');
    const sizeInBytes = Buffer.byteLength(rawBase64, 'base64');
    if (sizeInBytes > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `Image too large (${(sizeInBytes / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`,
      );
    }

    /* ── Upload ─────────────────────────────────────────── */
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
    );

    this.logger.log(`Uploaded image → ${result.secure_url}`);
    return result.secure_url;
  }
}
