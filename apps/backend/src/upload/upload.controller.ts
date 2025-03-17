import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadService } from './upload.service';
import { Public } from '../auth/public.decorator';
import { readdir } from 'fs/promises';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Generate a unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      path: this.uploadService.getFileUrl(file.filename),
    };
  }

  @Get('images')
  async getAllImages() {
    const uploadPath = this.uploadService.getUploadPath();
    const files = await readdir(uploadPath);
    
    // Filter only image files (optional, depends on your requirements)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    
    return {
      images: imageFiles.map(filename => ({
        filename,
        url: this.uploadService.getFileUrl(filename)
      }))
    };
  }
}