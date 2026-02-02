import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService, CloudinaryResponse } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const multerOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type. Only images are allowed.'), false);
    }
  },
};

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<{
    success: boolean;
    data: CloudinaryResponse;
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.uploadsService.validateFile(file);
    const result = await this.uploadsService.uploadFile(file, folder);

    return {
      success: true,
      data: result,
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<{
    success: boolean;
    data: CloudinaryResponse[];
  }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate all files
    files.forEach((file) => this.uploadsService.validateFile(file));

    const results = await this.uploadsService.uploadMultipleFiles(files, folder);

    return {
      success: true,
      data: results,
    };
  }

  @Delete('single/:publicId')
  async deleteSingle(
    @Param('publicId') publicId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Decode the public_id (it might contain slashes encoded as %2F)
    const decodedPublicId = decodeURIComponent(publicId);
    await this.uploadsService.deleteFile(decodedPublicId);
    
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  @Delete('multiple')
  async deleteMultiple(
    @Body('publicIds') publicIds: string[],
  ): Promise<{ success: boolean; message: string }> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('No public IDs provided');
    }

    await this.uploadsService.deleteMultipleFiles(publicIds);
    
    return {
      success: true,
      message: 'Files deleted successfully',
    };
  }

  @Post('delete-by-url')
  async deleteByUrl(
    @Body('url') url: string,
  ): Promise<{ success: boolean; message: string }> {
    const publicId = this.uploadsService.extractPublicId(url);
    
    if (!publicId) {
      throw new BadRequestException('Could not extract public ID from URL');
    }

    await this.uploadsService.deleteFile(publicId);
    
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}