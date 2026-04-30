import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  async createApplication(@GetUser() user: any, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create({
      ...createApplicationDto,
      userId: user._id,
    });
  }

  @Get()
  async getApplications(@GetUser() user: any) {
    return this.applicationsService.findByUserId(user._id);
  }

  @Get(':id')
  async getApplication(@GetUser() user: any, @Param('id') id: string) {
    const application = await this.applicationsService.findByIdAndUserId(id, user._id);
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
    return this.applicationsService.update(id, user._id, updateApplicationDto);
  }

  @Delete(':id')
  async deleteApplication(@GetUser() user: any, @Param('id') id: string) {
    return this.applicationsService.delete(id, user._id);
  }
}
