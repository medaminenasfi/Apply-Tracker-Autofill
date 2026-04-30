import { Controller, Get, Put, Post, UseGuards, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
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
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const cvUrl = `/uploads/cv/${file.filename}`;
    return this.profileService.updateCvUrl(user._id, cvUrl);
  }
}
