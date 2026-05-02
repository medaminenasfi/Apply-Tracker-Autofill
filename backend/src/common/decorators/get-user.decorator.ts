import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Normalize _id to string to prevent type mismatches
    // Note: _id is allowed to be ObjectId (MongoDB field), but we normalize for consistency
    if (user._id && typeof user._id !== 'string') {
      user._id = String(user._id);
    }

    return data ? user?.[data] : user;
  },
);
