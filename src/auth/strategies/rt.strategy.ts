import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { Strategy } from "passport-jwt";
import { JwtPayload, JwtPayloadWithRt } from "../types";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy,'jwt-refresh') {
    constructor(config:ConfigService){
        super({
            jwtFromRequest : (req: Request) => {
                let token = null;
                if(req && req.cookies){
                    token = req.cookies['refresh_token'];
                }
                return token;
            },
            secretOrKey : config.getOrThrow<string>('REFRESH_SECRET'),
            passReqToCallback:true,
        })
    }

    validate(req:Request,payload : JwtPayload):JwtPayloadWithRt {
        const refreshToken = req.cookies['refresh_token'];

        if(!refreshToken) throw new ForbiddenException('Refresh token not found');

        return {...payload,refreshToken};
    }
}