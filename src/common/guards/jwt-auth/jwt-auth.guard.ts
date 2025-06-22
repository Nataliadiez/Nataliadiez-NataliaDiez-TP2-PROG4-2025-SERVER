import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('Token no proporcionado');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token inválido');

    try {
      const secreto = this.configService.get<string>('JWT_SECRET');
      if (!secreto) throw new Error('JWT_SECRET no está definido en .env');

      const payload = verify(String(token), secreto);
      request.user = payload;
      return true;
    } catch (error) {
      console.error('Error al verificar el token:', error.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
