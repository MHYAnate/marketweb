import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    const directories = ['', 'goods', 'vendors', 'avatars'];
    directories.forEach((dir) => {
      const path = join(this.uploadPath, dir);
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    });
  }

  getFilePath(filename: string): string {
    return `${this.configService.get('API_PREFIX')}/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = join(this.uploadPath, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = this.configService.get<number>('MAX_FILE_SIZE') || 5 * 1024 * 1024;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / 1024 / 1024}MB limit.`);
    }
  }
}