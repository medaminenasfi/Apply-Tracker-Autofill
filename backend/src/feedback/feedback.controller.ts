import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@GetUser() user, @Body() createFeedbackDto: CreateFeedbackDto) {
    console.log('Creating feedback with user:', user);
    console.log('User _id:', user._id);
    return this.feedbackService.create(user._id, createFeedbackDto);
  }

  @Get('my')
  findMyFeedback(@GetUser() user) {
    return this.feedbackService.findUserFeedback(user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user) {
    return this.feedbackService.findOne(id, user._id);
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
