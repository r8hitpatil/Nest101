import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

@Injectable()
export class JwtSignService{
    constructor(private readonly jwtService : JwtService){}

    sign(payload:any,secret:string,expiresIn:JwtSignOptions['expiresIn']) {
        return this.jwtService.signAsync(payload,{secret,expiresIn});
    }
}