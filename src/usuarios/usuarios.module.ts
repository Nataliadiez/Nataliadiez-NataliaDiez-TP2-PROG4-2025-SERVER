import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { Publicacione, PublicacioneSchema } from '../publicaciones/entities/publicacione.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Publicacione.name, schema: PublicacioneSchema },
    ]),
    MulterModule.register({
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
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
