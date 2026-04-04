import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { Strategy } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(config: ConfigService){
        super({
            jwtFromRequest : (req:Request) => {
                let token = null;
                if(req && req.cookies){
                    token = req.cookies['access_token'];
                }
                return token;
            },
            secretOrKey : config.getOrThrow<string>('ACCESS_SECRET'),
        })
    }

    validate(payload:JwtPayload){
        return payload;
    }
}