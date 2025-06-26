import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';

@Module({
  imports: [PublicacionesModule],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}
