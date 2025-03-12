import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'your_jwt_secret',
    });
  }

  async validate(payload: JwtPayload) {
    // Here we could fetch the user from a database if needed
    // For now, we'll just return the payload which will be attached to the request
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    console.log('validate');
    console.log(payload);

    return {
      userId: payload.sub.toString(), // Convert to string for consistency in the logging service
      email: payload.email,
    };
  }
}
