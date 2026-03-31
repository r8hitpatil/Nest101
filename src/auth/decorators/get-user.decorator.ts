import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtUser } from "../types";

export const GetUser = createParamDecorator((data : keyof JwtUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user as JwtUser;

    // checks data is passed , checks whether keys are related to user response then only return complete user
    return data ? user?.[data] : user; 
})
