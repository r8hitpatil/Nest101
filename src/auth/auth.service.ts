import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { UserService } from 'src/user/user.service';
import * as argon from 'argon2';
import { LoginDto } from './dto/loginUser.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtSignService,JwtVerifyService } from './jwt';
import { Config } from 'src/common/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService:UserService,
        private readonly prisma: PrismaService,
        private readonly signService: JwtSignService,
        private readonly verifyService: JwtVerifyService,
        private readonly configService:ConfigService
    ){}

    async registerUser(registerDto: RegisterDto){
        const hash = await argon.hash(registerDto.password);
        const newUser = await this.userService.createUser({ ...registerDto,password:hash });

        if(!newUser){
            throw new Error('Invalid credentials');
        }

        const payload = { id: newUser.id , sub: newUser.id , role: [newUser.role] };

        const JWT_RT_EXPIRES_IN = Config.jwt.refreshToken.expiresInMs;
        const JWT_AT_EXPIRES_IN = Config.jwt.accessToken.expiresInMs;
        
        const JWT_RT_SECRET = this.configService.getOrThrow<string>('REFRESH_SECRET');
        const JWT_AT_SECRET = this.configService.getOrThrow<string>('ACCESS_SECRET');

        const rToken = await this.signService.sign(payload,JWT_RT_SECRET,JWT_RT_EXPIRES_IN);
        const aToken = await this.signService.sign(payload,JWT_AT_SECRET,JWT_AT_EXPIRES_IN);

        // const accessToken = await this.jwtService.signAsync(payload, {
        //     secret: this.configService.get('ACCESS_SECRET'),
        //     expiresIn: '15m',
        // });

        // const refreshToken = await this.jwtService.signAsync(payload, {
        //     secret: this.configService.get('REFRESH_SECRET'),
        //     expiresIn: '7d',
        // });

        const hashedRt = await argon.hash(rToken);

        // Create new session ( new refreshTokens )
        await this.prisma.refreshToken.create({
        data: {
            userId: newUser.id,
            tokenHash: hashedRt,
        },
    });

    return {
        rToken,
        aToken
    };
    }

    async loginUser(loginDto: LoginDto){
        const userDetails = await this.prisma.user.findUnique({where : {email : loginDto.email}});
        if (!userDetails) {
            throw new Error('Invalid credentials');
        }
        const check = await argon.verify(userDetails.password,loginDto.password);

        if (!check) {
            throw new Error('Invalid credentials');
        }

        const payload = { sub: userDetails.id , role: userDetails.role }

        const JWT_RT_EXPIRES_IN = Config.jwt.refreshToken.expiresInMs;
        const JWT_AT_EXPIRES_IN = Config.jwt.accessToken.expiresInMs;
        
        const JWT_RT_SECRET = this.configService.getOrThrow<string>('REFRESH_SECRET');
        const JWT_AT_SECRET = this.configService.getOrThrow<string>('ACCESS_SECRET');

        const aToken = await this.signService.sign(payload,JWT_AT_SECRET,JWT_AT_EXPIRES_IN);
        const rToken = await this.signService.sign(payload,JWT_RT_SECRET,JWT_AT_EXPIRES_IN);

    //     const accessToken = await this.jwtService.signAsync(payload, {
    //     secret: this.configService.get('ACCESS_SECRET'),
    //     expiresIn: '15m',
    // });

    // const refreshToken = await this.jwtService.signAsync(payload, {
    //     secret: this.configService.get('REFRESH_SECRET'),
    //     expiresIn: '7d',
    // });

    const hashedRt = await argon.hash(rToken);

    // Delete old sessions ( ivalidate old refreshTokens )
    await this.prisma.refreshToken.deleteMany({
        where : {
            userId : userDetails.id,
        },
    })

    // Create new session ( new refreshTokens )
    await this.prisma.refreshToken.create({
        data: {
            userId: userDetails.id,
            tokenHash: hashedRt,
        },
    });

    return {
        aToken,
        rToken
    };
    }

    // async reAccessToken(refreshToken:string){
    //     if(!refreshToken){
    //         throw new UnauthorizedException('No refresh token');
    //     }
        
    //     let payload : any;
        
    //     try {
    //         payload = await this.jwtService.verifyAsync(refreshToken,{
    //         secret : this.configService.get('REFRESH_SECRET')
    //     })
    //     } catch (error) {
    //         throw new UnauthorizedException('Invalid refresh token');
    //     }

    //     const storedToken = await this.prisma.refreshToken.findMany({
    //         where : {
    //             userId : payload.sub,
    //             isRevoked : false,
    //         },
    //     })

    //     if(!storedToken.length){
    //         throw new UnauthorizedException('Session not found');
    //     }

    //     let validToken;

    //     for(const token of storedToken){
    //         const isMatch = await argon.verify(token.tokenHash,refreshToken);
    //         if(isMatch){
    //             validToken = token;
    //             break;
    //         }
    //     }

    //     await this.prisma.refreshToken.update({
    //         where : { id : validToken.id },
    //         data : { isRevoked : true }
    //     })

    //     const newPayload = {
    //         sub : payload.sub,
    //         role : payload.role
    //     }

    //     const newAccessToken = await this.jwtService.signAsync(newPayload,{
    //         secret : this.configService.get('ACCESS_SECRET'),
    //         expiresIn : '15m'
    //     })

    //     const newRefreshToken = await this.jwtService.signAsync(newPayload,{
    //         secret : this.configService.get('REFRESH_SECRET'),
    //         expiresIn : '7d'
    //     })

    //     const hashedRt = await argon.hash(newRefreshToken);

    //     await this.prisma.refreshToken.create({
    //         data : {
    //             userId : payload.sub,
    //             tokenHash : hashedRt
    //         }
    //     })

    //     return { 
    //         accessToken : newAccessToken,
    //         refreshToken : newRefreshToken
    //     }
    // }
}
