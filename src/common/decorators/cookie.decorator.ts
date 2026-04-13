import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshToken = createParamDecorator((data : any,ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.cookies?.refresh_token;
});