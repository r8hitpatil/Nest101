import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AtStrategy,RtStrategy } from './strategies';
import { JwtSignService,JwtVerifyService } from './jwt';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule,
    JwtModule.register({
      secret: process.env.ACCESS_SECRET, // or from ConfigService
      signOptions: { expiresIn: '15m' } // optional default
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,AtStrategy,RtStrategy,JwtSignService,JwtVerifyService]
})
export class AuthModule {}
