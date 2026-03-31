import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { LoginDto } from './dto/loginUser.dto';
import { JwtAuthGuard } from './guards';
import type { Response } from 'express';
import { GetUser } from './decorators';
import type { JwtUser } from './types';
import { setRefreshToken } from './utils/set-refresh-token';
import { RefreshToken } from 'src/common/decorators';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}
    @HttpCode(201)
    @Post('register')
    async register(@Body() registerUserDto:RegisterDto, @Res({ passthrough : true }) res:Response){
        const tokens = await this.authService.registerUser(registerUserDto);
        
        setRefreshToken(res,tokens.refreshToken);

        return {
            accessToken : tokens.accessToken
        }
    }

    @Post('login')
    async login(@Body() LoginDto:LoginDto,@Res({ passthrough : true }) res:Response){
        const tokens = await this.authService.loginUser(LoginDto);
        
        setRefreshToken(res,tokens.refreshToken);

        return {
            accessToken : tokens.accessToken
        }
    }

    @Post('refresh')
    async newAccessToken(
        @RefreshToken() refreshToken: string,
        @Res({ passthrough : true }) res: Response,
    ){
        const tokens = await this.authService.reAccessToken(refreshToken);

        setRefreshToken(res,tokens.refreshToken);

        return {
            accessToken : tokens.accessToken
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    // why we imported JwtUser as type is we need it as a type during runtime before it was crashing like interface JwtUser {}
    async getProfile(@GetUser() user:JwtUser) {
        return {
            data : user
        };
    }
}
