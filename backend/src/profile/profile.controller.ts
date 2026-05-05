import { Controller, Get, Put, Post, Delete, UseGuards, Body, UseInterceptors, UploadedFile, BadRequestException, Logger, Param, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  
  constructor(private profileService: ProfileService) {}

  @Get()
  async getProfile(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    console.log('[PROFILE_CONTROLLER] GET /profile called for userId:', userIdString);
    let profile = await this.profileService.findByUserId(userIdString) as any;
    console.log('Profile found:', profile);
    
    if (!profile) {
      // Auto-create profile if it doesn't exist
      console.log('No profile found, creating new profile');
      profile = await this.profileService.create({
        userId: userIdString,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        countryCode: user.countryCode || '+216',
        university: user.university || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        cvUrl: null,
        profilePictureUrl: null,
      });
      console.log('Profile created:', profile);
    }
    
    // Return profile with new field names, fallback to old ones if needed
    const response = {
      _id: profile._id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || profile.phoneNumber,
      countryCode: profile.countryCode || '+216',
      university: profile.university,
      linkedin: profile.linkedin || profile.linkedinUrl,
      portfolio: profile.portfolio || profile.portfolioUrl,
      cvUrl: profile.cvUrl,
      profilePictureUrl: profile.profilePictureUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    console.log('Returning profile:', response);
    return response;
  }

  @Put()
  async updateProfile(@GetUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      const userIdString = normalizeUserId(user._id);
      return this.profileService.update(userIdString, {
        ...updateProfileDto,
        userId: userIdString,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  @Get('cv')
  async getCv(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    const profile = await this.profileService.findByUserId(userIdString);
    
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
    const userIdString = normalizeUserId(user._id);
    const profile = await this.profileService.findByUserId(userIdString);
    
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
    const filePath = join(process.cwd(), 'uploads', 'cv', filename);

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
        filename: (req: any, file, cb) => {
          // Get user from request (attached by JwtAuthGuard)
          const user = req.user;
          
          // Get firstName and lastName from profile if available, otherwise from user
          let firstName = '';
          let lastName = '';
          
          if (user.firstName) firstName = user.firstName;
          if (user.lastName) lastName = user.lastName;
          
          // Format: first_name_last_name_cv_timestamp.pdf (lowercase, underscores)
          const timestamp = Date.now();
          const baseName = `${firstName}_${lastName}_cv_${timestamp}`;
          const sanitizedName = baseName
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          
          cb(null, `${sanitizedName}${extname(file.originalname)}`);
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

    const userIdString = normalizeUserId(user._id);

    // Delete old CV if exists
    const profile = await this.profileService.findByUserId(userIdString);
    if (profile && profile.cvUrl) {
      const oldCvPath = path.join(process.cwd(), profile.cvUrl);
      if (fs.existsSync(oldCvPath)) {
        fs.unlinkSync(oldCvPath);
      }
    }

    const cvUrl = `/uploads/cv/${file.filename}`;
    const updatedProfile = await this.profileService.updateCvUrl(userIdString, cvUrl, user);
    return updatedProfile;
  }

  @Delete('cv')
  async deleteCv(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    const profile = await this.profileService.findByUserId(userIdString);
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
    const updatedProfile = await this.profileService.updateCvUrl(userIdString, null);
    return updatedProfile;
  }

  @Post('migrate')
  async migrateProfiles() {
    await this.profileService.migrateOldFieldNames();
    return { message: 'Migration completed successfully' };
  }

  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/profile-pictures';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const fileExt = extname(file.originalname).toLowerCase();
        const extnameValid = allowedTypes.test(fileExt);
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extnameValid) {
          return cb(null, true);
        } else {
          return cb(new BadRequestException('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadProfilePicture(@GetUser() user: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Profile picture upload called');
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    console.log('File received:', file.filename);

    const userIdString = normalizeUserId(user._id);

    // Delete old profile picture if exists
    const profile = await this.profileService.findByUserId(userIdString);
    if (profile && (profile as any).profilePictureUrl) {
      const oldPicturePath = path.join(process.cwd(), (profile as any).profilePictureUrl);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;
    console.log('Profile picture URL:', profilePictureUrl);
    const updatedProfile = await this.profileService.updateProfilePictureUrl(userIdString, profilePictureUrl);
    console.log('Updated profile:', updatedProfile);
    return updatedProfile;
  }

  @Delete('profile-picture')
  async deleteProfilePicture(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    const profile = await this.profileService.findByUserId(userIdString);
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    if (!(profile as any).profilePictureUrl) {
      throw new BadRequestException('No profile picture to delete');
    }

    // Delete profile picture file
    const picturePath = path.join(process.cwd(), (profile as any).profilePictureUrl);
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    // Remove profilePictureUrl from profile
    const updatedProfile = await this.profileService.updateProfilePictureUrl(userIdString, null);
    return updatedProfile;
  }
}
