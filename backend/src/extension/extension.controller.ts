import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ExtensionService } from './extension.service';
import { SaveApplicationDto } from './dto';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('extension')
@UseGuards(AuthGuard('jwt'))
export class ExtensionController {
  constructor(private extensionService: ExtensionService) {}

  @Get('profile')
  async getProfile(@GetUser() user: any) {
    const userIdString = normalizeUserId(user._id);
    return this.extensionService.getUserProfile(userIdString);
  }

  @Post('save-application')
  async saveApplication(@GetUser() user: any, @Body() saveApplicationDto: SaveApplicationDto) {
    const userIdString = normalizeUserId(user._id);
    const application = await this.extensionService.saveApplication(userIdString, saveApplicationDto);
    return { message: 'Application saved successfully', application };
  }
}
