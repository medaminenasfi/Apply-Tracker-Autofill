import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

@Controller('profile')
export class ProfilePublicController {
  @Get('cv/public-preview/:filename')
  async previewCVPublic(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(process.cwd(), 'uploads', 'cv', safeFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('CV file not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return createReadStream(filePath).pipe(res);
  }
}
