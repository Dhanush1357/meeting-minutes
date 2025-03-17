import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor() {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
  }

  getUploadPath(): string {
    return join(process.cwd(), 'uploads');
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  fileExists(filename: string): boolean {
    const filePath = join(this.getUploadPath(), filename);
    return existsSync(filePath);
  }
}