import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { EnterpriseService } from './enterprise.service';

@Controller('enterprise')
@UseGuards(AuthGuard('jwt'))
export class EnterpriseController {
  constructor(private enterpriseService: EnterpriseService) {}

  @Get('counselor/dashboard')
  counselorDashboard(@GetUser() user: any) {
    return this.enterpriseService.getCounselorDashboard(String(user._id));
  }

  @Get('organizations')
  listOrgs() {
    return this.enterpriseService.listOrganizations();
  }

  @Post('organizations')
  createOrg(@Body() body: { name: string; type: 'university' | 'enterprise'; seatLimit?: number }) {
    return this.enterpriseService.createOrganization(body);
  }

  @Post('organizations/:orgId/members')
  addMember(@Param('orgId') orgId: string, @Body() body: { userId: string }) {
    return this.enterpriseService.addMember(orgId, body.userId);
  }
}
