import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

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
   * Returns the secure URL of the uploaded image.
   */
  async uploadImage(
    base64Data: string,
    folder = 'moody/avatars',
  ): Promise<string> {
    // Ensure the string has the data URI prefix
    const dataUri = base64Data.startsWith('data:')
      ? base64Data
      : `data:image/jpeg;base64,${base64Data}`;

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
