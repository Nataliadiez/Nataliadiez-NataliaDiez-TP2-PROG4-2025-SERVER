import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { Publicacione, PublicacioneSchema } from './entities/publicacione.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PublicacionesGateway } from './publicaciones.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publicacione.name, schema: PublicacioneSchema }]),
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
  controllers: [PublicacionesController],
  providers: [PublicacionesService, PublicacionesGateway],
})
export class PublicacionesModule {}
