import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { UpdatePublicacioneDto } from './dto/update-publicacione.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { imageFileFilter, imageFileLimits } from 'src/common/utils/file-upload.util';
import { ObjectId } from 'mongoose';
import { AdminGuard } from 'src/common/guards/admin/admin.guard';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      fileFilter: imageFileFilter,
      limits: imageFileLimits,
    }),
  )
  create(
    @Body() dto: CreatePublicacioneDto,
    @Req() req: Request,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    const usuario = req as Request & { user: any };
    const autorId = usuario.user.id;
    return this.publicacionesService.create(dto, String(autorId), imagen);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
    @Query('orden') orden?: string,
    @Query('autorId') autorId?: string,
  ) {
    const skipNum = Number(skip) || 0;
    const limitNum = Number(limit) || 5;
    const ordenTyped: 'createdAt' | 'likes' | undefined =
      orden === 'likes' || orden === 'createdAt' ? orden : undefined;
    return this.publicacionesService.findAll(skipNum, limitNum, ordenTyped, autorId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('inactivas')
  findInactivas() {
    return this.publicacionesService.findInactivas();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('/inactivas/:usuarioId')
  obtenerPublicacionesInactivasPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.publicacionesService.findInactivasPorUsuario(usuarioId);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('imagen', {
      fileFilter: imageFileFilter,
      limits: imageFileLimits,
    }),
  )
  update(@Param('id') id: string, @UploadedFile() imagen: Express.Multer.File, @Body() body: any) {
    return this.publicacionesService.update(id, body, imagen);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/like')
  darLike(@Param('id') publicacionId: string, @Req() req: Request) {
    const usuario = req as Request & { user: any };
    const usuarioId = usuario.user.id;
    return this.publicacionesService.toggleLike(publicacionId, String(usuarioId));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/comentarios')
  obtenerComentarios(
    @Param('id') publicacionId: string,
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '3',
  ) {
    const skipNum = Number(skip) || 0;
    const limitNum = Number(limit) || 3;

    return this.publicacionesService.obtenerComentarios(publicacionId, skipNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comentarios')
  comentar(
    @Param('id') publicacionId: string,
    @Req() req: Request,
    @Body('contenido') contenido: string,
  ) {
    const usuario = req as Request & { user: any };
    const usuarioId = usuario.user.id;
    return this.publicacionesService.agregarComentario(publicacionId, String(usuarioId), contenido);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const usuario = req as Request & { user: any };
    const usuarioId = usuario.user.id;
    const esAdmin = usuario.user.perfil === 'administrador';
    return this.publicacionesService.remove(id, String(usuarioId), esAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(id);
  }
}
