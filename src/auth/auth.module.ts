import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    UsuariosModule,
    MulterModule.register({
      dest: 'public/images',
      storage: diskStorage({
        destination(req, file, callback) {
          callback(null, 'public/images');
        },
        filename(req, file, callback) {
          const nuevoNombre = `${Date.now()}-${file.originalname}`;
          callback(null, nuevoNombre);
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
