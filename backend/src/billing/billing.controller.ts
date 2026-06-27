import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Headers,
  RawBodyRequest,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { UsersService } from '../users/users.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Get('status')
  getStatus() {
    return this.billingService.getStatus();
  }

  @Get('plans')
  getPlans() {
    return {
      free: { name: 'Free', price: 0, applicationLimit: 20, features: ['Basic autofill', 'Manual vault', 'Kanban tracker'] },
      pro: {
        name: 'Pro',
        priceMonthly: 7,
        features: ['Unlimited applications', 'AI autofill', 'Ghost save', 'Match score', 'Smart reminders'],
        stripeConfigured: this.billingService.isConfigured(),
      },
      advanced: {
        name: 'Advanced',
        priceMonthly: 19,
        features: ['Auto-apply', 'Interview simulator', 'Achievement harvest', 'Enterprise tools'],
      },
      stripe: this.billingService.getStatus(),
    };
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  async checkout(@GetUser() user: any) {
    const priceId = this.billingService.getProPriceId();
    if (!priceId) throw new BadRequestException('Pro plan price not configured');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const dbUser = await this.usersService.findById(normalizeUserId(user._id));

    return this.billingService.createCheckoutSession({
      customerId: dbUser?.stripeCustomerId,
      customerEmail: user.email,
      priceId,
      userId: normalizeUserId(user._id),
      successUrl: `${frontendUrl}/settings?billing=success`,
      cancelUrl: `${frontendUrl}/pricing?billing=cancelled`,
    });
  }

  @Post('portal')
  @UseGuards(AuthGuard('jwt'))
  async portal(@GetUser() user: any) {
    const dbUser = await this.usersService.findById(normalizeUserId(user._id));
    if (!dbUser?.stripeCustomerId) throw new BadRequestException('No billing account found');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    return this.billingService.createPortalSession(dbUser.stripeCustomerId, `${frontendUrl}/settings`);
  }

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.billingService.constructWebhookEvent(req.rawBody as Buffer, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      if (userId && session.customer) {
        await this.usersService.updateBilling(userId, {
          plan: 'pro',
          stripeCustomerId: session.customer as string,
          subscriptionStatus: 'active',
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any;
      const user = await this.usersService.findByStripeCustomerId(sub.customer as string);
      if (user) {
        await this.usersService.updateBilling(String(user._id), {
          plan: 'free',
          subscriptionStatus: 'cancelled',
        });
      }
    }

    res.json({ received: true });
  }
}
