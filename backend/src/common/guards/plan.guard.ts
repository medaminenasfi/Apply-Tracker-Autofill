import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAN_KEY, PlanTier } from '../decorators/require-plan.decorator';

const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  advanced: 2,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.getAllAndOverride<PlanTier>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlan) return true;

    const { user } = context.switchToHttp().getRequest();
    const userPlan = user?.plan || 'free';
    const requiredRank = PLAN_RANK[requiredPlan] ?? 1;
    const userRank = PLAN_RANK[userPlan] ?? 0;

    if (userRank < requiredRank) {
      throw new ForbiddenException(
        `This feature requires the ${requiredPlan} plan. Upgrade at /pricing`,
      );
    }

    return true;
  }
}
