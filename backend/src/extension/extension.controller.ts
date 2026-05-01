import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ExtensionService } from './extension.service';
import { SaveApplicationDto } from './dto/save-application.dto';

@Controller('extension')
@UseGuards(JwtAuthGuard)
export class ExtensionController {
  constructor(private extensionService: ExtensionService) {}

  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return this.extensionService.getUserProfile(user._id);
  }

  @Post('save-application')
  async saveApplication(@GetUser() user: any, @Body() saveApplicationDto: SaveApplicationDto) {
    const application = await this.extensionService.saveApplication(user._id, saveApplicationDto);
    return { message: 'Application saved successfully', application };
  }
}
