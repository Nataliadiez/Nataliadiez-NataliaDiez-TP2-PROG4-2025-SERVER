import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: any }>();
    const user = request.user;

    if (!user || user.perfil !== 'administrador') {
      throw new ForbiddenException('Acceso denegado: solo administradores');
    }
    return true;
  }
}
