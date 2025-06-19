import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { imageFileFilter, imageFileLimits } from 'src/common/utils/file-upload.util';

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
    return this.authService.registrar(body, imagenPerfil);
  }

  @Post('/login')
  login(@Body() body: any) {
    return this.authService.loguear(body);
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
