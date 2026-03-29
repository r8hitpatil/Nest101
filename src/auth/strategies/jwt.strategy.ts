import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtUser } from '../types/user-request.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(config: ConfigService,private readonly prisma: PrismaService,){
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow('ACCESS_SECRET'),
        })
    }

    async validate(payload: any): Promise<JwtUser>{
        const user = await this.prisma.user.findUnique({
            where : {
                id : payload.sub
            },
            select : {
                id:true,
                fname:true,
                email:true,
                role:true
            }
        });

        if(!user){
            throw new UnauthorizedException();
        }

        return {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
    }
}