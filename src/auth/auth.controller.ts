import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Headers,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { imageFileFilter, imageFileLimits } from 'src/common/utils/file-upload.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { Request } from 'express';
import { AdminGuard } from 'src/common/guards/admin/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      fileFilter: imageFileFilter,
      limits: imageFileLimits,
    }),
  )
  registro(@UploadedFile() imagenPerfil: Express.Multer.File, @Body() body: any) {
    const perfil = 'usuario';
    return this.authService.registrar(body, imagenPerfil, perfil);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('/registroAdmin')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      fileFilter: imageFileFilter,
      limits: imageFileLimits,
    }),
  )
  registroAdmin(
    @Req() req: Request & { user: any },
    @UploadedFile() imagenPerfil: Express.Multer.File,
    @Body() body: any,
  ) {
    const perfil = 'administrador';
    return this.authService.registrar(body, imagenPerfil, perfil);
  }

  @Post('/login')
  login(@Body() body: any) {
    return this.authService.loguear(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/autorizar')
  autorizar(@Req() req: Request & { user: any }) {
    return {
      autorizado: true,
      usuario: req.user,
    };
  }

  @Get('/datos')
  datos(@Headers('Authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = auth?.split(' ')[1];
    return this.authService.traerDatos(token);
  }

  @Post('/refresh')
  refrescarToken(@Headers('Authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = auth?.split(' ')[1];
    try {
      return this.authService.refrescarToken(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
