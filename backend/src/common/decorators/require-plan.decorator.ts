import { SetMetadata } from '@nestjs/common';

export const PLAN_KEY = 'requiredPlan';
export type PlanTier = 'pro' | 'advanced';

export const RequirePlan = (plan: PlanTier) => SetMetadata(PLAN_KEY, plan);
