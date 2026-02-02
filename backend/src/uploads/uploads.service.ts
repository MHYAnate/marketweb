import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
}

@Injectable()
export class UploadsService {
  private readonly assetFolder: string;
  private readonly presetName: string;

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.assetFolder = this.configService.get<string>('CLOUDINARY_ASSET_FOLDER') || 'marketplace';
    this.presetName = this.configService.get<string>('CLOUDINARY_PRESET_NAME') || 'ml_default';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const uploadFolder = folder
        ? `${this.assetFolder}/${folder}`
        : this.assetFolder;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          upload_preset: this.presetName,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              resource_type: result.resource_type,
            });
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new BadRequestException(`Delete failed: ${error.message}`));
        } else {
          resolve(result);
        }
      });
    });
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<{ deleted: Record<string, string> }> {
    return new Promise((resolve, reject) => {
      cloudinary.api.delete_resources(publicIds, (error, result) => {
        if (error) {
          reject(new BadRequestException(`Delete failed: ${error.message}`));
        } else {
          resolve(result);
        }
      });
    });
  }

  validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit.');
    }
  }

  // Helper to extract public_id from Cloudinary URL
  extractPublicId(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      if (uploadIndex === -1) return null;

      // Get everything after 'upload/v{version}/'
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      return pathAfterUpload.replace(/\.[^/.]+$/, '');
    } catch {
      return null;
    }
  }

  // Generate optimized URL with transformations
  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          width: options?.width || 800,
          height: options?.height || 800,
          crop: options?.crop || 'limit',
        },
        { quality: options?.quality || 'auto' },
        { fetch_format: 'auto' },
      ],
    });
  }

  // Generate thumbnail URL
  getThumbnailUrl(publicId: string, size: number = 200): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: size, height: size, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
  }
}