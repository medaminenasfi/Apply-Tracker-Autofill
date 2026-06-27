import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe | null = null;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (key) {
      this.stripe = new Stripe(key);
    }
  }

  isConfigured(): boolean {
    return !!this.stripe;
  }

  async createCheckoutSession(params: {
    customerId?: string;
    customerEmail: string;
    priceId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      customer_email: params.customerId ? undefined : params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { userId: params.userId },
    });

    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new BadRequestException('Webhook secret not configured');
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  getProPriceId(): string {
    return (
      this.configService.get<string>('STRIPE_PRICE_ID_PRO') ||
      this.configService.get<string>('STRIPE_PRICE_ID_MONTHLY') ||
      ''
    );
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      hasProPriceId: !!this.getProPriceId(),
      hasWebhookSecret: !!this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
    };
  }
}
