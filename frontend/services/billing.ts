import { userApi } from './api';

export interface BillingPlans {
  free: { name: string; price: number; applicationLimit: number; features: string[] };
  pro: { name: string; priceMonthly: number; features: string[]; stripeConfigured?: boolean };
  advanced: { name: string; priceMonthly: number; features: string[] };
}

export const billingApi = {
  getPlans: () => userApi.get<BillingPlans>('/billing/plans').then((r) => r.data),
  checkout: () => userApi.post<{ url: string }>('/billing/checkout').then((r) => r.data),
  portal: () => userApi.post<{ url: string }>('/billing/portal').then((r) => r.data),
};
