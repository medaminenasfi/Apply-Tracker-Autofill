import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AutoApplyService } from './auto-apply.service';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('auto-apply')
@UseGuards(AuthGuard('jwt'))
export class AutoApplyController {
  constructor(private autoApplyService: AutoApplyService) {}

  @Get('criteria')
  getCriteria(@GetUser() user: any) {
    return this.autoApplyService.getCriteria(normalizeUserId(user._id));
  }

  @Post('criteria')
  saveCriteria(@GetUser() user: any, @Body() body: { title: string; location?: string; keywords?: string[] }) {
    return this.autoApplyService.saveCriteria(normalizeUserId(user._id), body);
  }

  @Get('queue')
  getQueue(@GetUser() user: any) {
    return this.autoApplyService.getQueue(normalizeUserId(user._id));
  }

  @Post('queue')
  addToQueue(
    @GetUser() user: any,
    @Body() body: { companyName: string; position: string; jobUrl: string; tailoredCoverLetter?: string },
  ) {
    return this.autoApplyService.addToQueue(normalizeUserId(user._id), body);
  }

  @Post('queue/:id/approve')
  approve(@GetUser() user: any, @Param('id') id: string) {
    return this.autoApplyService.approve(normalizeUserId(user._id), id);
  }
}
