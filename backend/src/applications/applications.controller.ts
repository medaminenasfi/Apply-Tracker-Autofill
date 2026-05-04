import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('applications')
@UseGuards(AuthGuard('jwt'))
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  async createApplication(@GetUser() user: any, @Body() createApplicationDto: CreateApplicationDto) {
    const userIdString = normalizeUserId(user._id);
    console.log('[CREATE_APPLICATION] userId:', userIdString, 'data:', createApplicationDto);
    const result = await this.applicationsService.create(createApplicationDto, userIdString);
    console.log('[CREATE_APPLICATION] created with id:', (result as any)._id, 'userId:', result.userId);
    return result;
  }

  @Get()
  async getApplications(@GetUser() user: any, @Res() res: Response) {
    const userIdString = normalizeUserId(user._id);
    console.log('[BACKEND_CONTROLLER] getApplications called for userId:', userIdString);
    const result = await this.applicationsService.findByUserId(userIdString);
    console.log('[BACKEND_CONTROLLER] getApplications returning count:', result.length);

    // Disable caching to prevent 304 responses
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    // Debug response
    return res.json({
      count: result.length,
      data: result,
      userId: userIdString,
    });
  }

  @Get(':id')
  async getApplication(@GetUser() user: any, @Param('id') id: string) {
    const userIdString = normalizeUserId(user._id);
    const application = await this.applicationsService.findByIdAndUserId(id, userIdString);
    if (!application) {
      return { message: 'Application not found' };
    }
    return application;
  }

  @Put(':id')
  async updateApplication(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    const userIdString = normalizeUserId(user._id);
    return this.applicationsService.update(id, userIdString, updateApplicationDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const userIdString = normalizeUserId(user._id);
    return this.applicationsService.updateStatus(id, userIdString, body.status);
  }

  @Delete(':id')
  async deleteApplication(@GetUser() user: any, @Param('id') id: string) {
    const userIdString = normalizeUserId(user._id);
    return this.applicationsService.delete(id, userIdString);
  }
}
