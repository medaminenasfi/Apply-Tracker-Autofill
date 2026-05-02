import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
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
}

@Controller('admin/feedback')
@UseGuards(JwtAuthGuard, AdminGuard)
@Roles('admin')
export class AdminFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('type') type?: string) {
    return this.feedbackService.findAll(status as any, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }
}
