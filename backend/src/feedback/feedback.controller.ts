import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Logger,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('feedback')
@UseGuards(AuthGuard('jwt'))
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(@GetUser() user: any, @Body() createFeedbackDto: CreateFeedbackDto) {
    try {
      const userIdString = normalizeUserId(user._id);
      this.logger.log(`Creating feedback with userId: ${userIdString}`);
      this.logger.log(`DTO data: ${JSON.stringify(createFeedbackDto)}`);
      return this.feedbackService.create(userIdString, createFeedbackDto);
    } catch (error: any) {
      this.logger.error(`Error creating feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('my')
  findMyFeedback(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    return this.feedbackService.findUserFeedback(userIdString);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    return this.feedbackService.findOne(id, userIdString);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    return this.feedbackService.delete(id, userIdString);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/feedback',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          cb(null, `feedback-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return {
      filename: file.filename,
      path: `/uploads/feedback/${file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:3000'}/uploads/feedback/${file.filename}`,
    };
  }
}

@Controller('admin/feedback')
@UseGuards(AuthGuard('jwt'))
export class AdminFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll(@Request() req: any, @Query('status') status?: string, @Query('type') type?: string) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.feedbackService.findAll(status as any, type);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.feedbackService.update(id, updateFeedbackDto);
  }
}
