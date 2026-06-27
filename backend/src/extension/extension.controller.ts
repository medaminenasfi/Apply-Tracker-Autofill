import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ExtensionService } from './extension.service';
import { SaveApplicationDto } from './dto/save-application.dto';
import { normalizeUserId } from '../common/utils/userId.util';
import { PlanGuard } from '../common/guards/plan.guard';
import { RequirePlan } from '../common/decorators/require-plan.decorator';

@Controller('extension')
@UseGuards(AuthGuard('jwt'))
export class ExtensionController {
  constructor(private extensionService: ExtensionService) {}

  @Get('profile')
  async getProfile(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    return this.extensionService.getUserProfile(userIdString, user.plan || 'free');
  }

  @Post('save-application')
  async saveApplication(@GetUser() user: any, @Body() saveApplicationDto: SaveApplicationDto) {
    const userIdString = normalizeUserId(user._id);
    const application = await this.extensionService.saveApplication(userIdString, saveApplicationDto);
    return { message: 'Application saved successfully', application };
  }

  @Post('ghost-save')
  @UseGuards(PlanGuard)
  @RequirePlan('pro')
  async ghostSave(@GetUser() user: any, @Body() body: SaveApplicationDto) {
    const userIdString = normalizeUserId(user._id);
    const result = await this.extensionService.ghostSave(userIdString, body);
    return {
      message: result.deduplicated
        ? 'Application already tracked for this job URL'
        : 'Application logged via ghost save',
      application: result.application,
      deduplicated: result.deduplicated,
    };
  }

  @Post('analyze-job')
  @UseGuards(PlanGuard)
  @RequirePlan('pro')
  async analyzeJob(@GetUser() user: any, @Body() body: { jobDescription: string; cvText?: string }) {
    const userIdString = normalizeUserId(user._id);
    return this.extensionService.analyzeJob(userIdString, body.jobDescription, body.cvText);
  }
}
