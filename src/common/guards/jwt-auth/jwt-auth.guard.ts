import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];
    if (!token) return false;

    try {
      const secreto = this.configService.get<string>('JWT_SECRET');
      if (typeof secreto !== 'string' || !secreto) {
        console.error('JWT_SECRET no está definido o no es un string');
        return false;
      }
      const payload = verify(token, secreto);
      request.user = payload;
      return true;
    } catch (error) {
      console.error('Token inválido:', error.message);
      return false;
    }
  }
}
