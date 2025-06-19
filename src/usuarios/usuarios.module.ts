import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioSchema } from './entities/usuario.entity';
import { PublicacioneSchema } from 'src/publicaciones/entities/publicacione.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Usuario', schema: UsuarioSchema },
      { name: 'Publicacione', schema: PublicacioneSchema },
    ]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [MongooseModule, UsuariosService], //exporta el modelo y el servicio para ser reutilizados en otros módulos
})
export class UsuariosModule {}
