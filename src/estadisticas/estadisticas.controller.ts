import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin/admin.guard';
import { ValidarFechasPipe } from 'src/pipes/validar-fechas/validar-fechas.pipe';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  @UseGuards(JwtAuthGuard, AdminGuard)
  publicacionesPorUsuario(@Query(new ValidarFechasPipe()) query: { desde: string; hasta: string }) {
    return this.estadisticasService.contarPublicacionesPorUsuario(query.desde, query.hasta);
  }

  @Get('comentarios-por-tiempo')
  @UseGuards(JwtAuthGuard, AdminGuard)
  comentariosPorTiempo(@Query(new ValidarFechasPipe()) query: { desde: string; hasta: string }) {
    return this.estadisticasService.contarComentariosPorTiempo(query.desde, query.hasta);
  }
}
