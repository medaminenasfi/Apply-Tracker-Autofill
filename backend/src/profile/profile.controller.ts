import { Controller, Get, Put, Post, Delete, UseGuards, Body, UseInterceptors, UploadedFile, BadRequestException, Logger, Param, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  
  constructor(private profileService: ProfileService) {}

  @Get()
  async getProfile(@GetUser() user: any) {
    const profile = await this.profileService.findByUserId(user._id);
    if (!profile) {
      return { message: 'Profile not found. Please create a profile first.' };
    }
    return profile;
  }

  @Put()
  async updateProfile(@GetUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(user._id, {
      ...updateProfileDto,
      userId: user._id,
    });
  }

  @Get('cv')
  async getCv(@GetUser() user: any) {
    this.logger.log('GET /profile/cv called');
    const profile = await this.profileService.findByUserId(user._id);
    
    if (!profile || !profile.cvUrl) {
      return { hasCV: false, cvUrl: null, filename: null };
    }
    
    // Extract filename from cvUrl
    const filename = path.basename(profile.cvUrl);
    return {
      hasCV: true,
      cvUrl: profile.cvUrl,
      filename: filename,
    };
  }

  @Get('cv/preview')
  async previewCV(@GetUser() user: any, @Res() res: Response) {
    const profile = await this.profileService.findByUserId(user._id);
    
    if (!profile || !profile.cvUrl) {
      throw new NotFoundException('CV not found');
    }
    
    const filePath = path.join(process.cwd(), profile.cvUrl);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('CV file not found');
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition');
    
    const fileStream = createReadStream(filePath);
    fileStream.on('error', (error) => {
      this.logger.error('Error streaming CV file:', error);
      if (!res.headersSent) {
        res.status(500).send('Error streaming file');
      }
    });
    
    return fileStream.pipe(res);
  }

  @Get('cv/public-preview/:filename')
  async previewCVPublic(@Param('filename') filename: string, @Res() res: Response) {
    console.log('Preview CV filename:', filename);
    const filePath = join(process.cwd(), 'uploads', 'cv', filename);
    console.log('Preview CV path:', filePath);

    if (!existsSync(filePath)) {
      throw new NotFoundException('CV file not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return createReadStream(filePath).pipe(res);
  }

  @Post('cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/cv';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `cv-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadCv(@GetUser() user: any, @UploadedFile() file: Express.Multer.File) {
    this.logger.log('POST /profile/cv called');
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Delete old CV if exists
    const profile = await this.profileService.findByUserId(user._id);
    if (profile && profile.cvUrl) {
      const oldCvPath = path.join(process.cwd(), profile.cvUrl);
      if (fs.existsSync(oldCvPath)) {
        fs.unlinkSync(oldCvPath);
      }
    }

    const cvUrl = `/uploads/cv/${file.filename}`;
    const updatedProfile = await this.profileService.updateCvUrl(user._id, cvUrl, user);
    return updatedProfile;
  }

  @Delete('cv')
  async deleteCv(@GetUser() user: any) {
    this.logger.log('DELETE /profile/cv called');
    const profile = await this.profileService.findByUserId(user._id);
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    if (!profile.cvUrl) {
      throw new BadRequestException('No CV to delete');
    }

    // Delete CV file from uploads/cv
    const cvPath = path.join(process.cwd(), profile.cvUrl);
    if (fs.existsSync(cvPath)) {
      fs.unlinkSync(cvPath);
    }

    // Remove cvUrl from profile
    const updatedProfile = await this.profileService.updateCvUrl(user._id, null);
    return updatedProfile;
  }
}
