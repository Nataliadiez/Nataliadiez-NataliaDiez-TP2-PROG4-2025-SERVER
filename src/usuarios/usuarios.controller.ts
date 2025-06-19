import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter, imageFileLimits } from 'src/common/utils/file-upload.util';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('me') // Perfil propio
  obtenerPerfil(@Req() req: Request & { user: any }) {
    const usuarioId = req.user.id;
    return this.usuariosService.obtenerPerfilyPosts(String(usuarioId));
  }

  @Post('me')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      fileFilter: imageFileFilter,
      limits: imageFileLimits,
    }),
  )
  actualizarPerfil(
    @Req() req: Request & { user: any },
    @Body() dto: UpdateUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    const usuarioId = req.user.id;
    return this.usuariosService.actualizarPerfil(String(usuarioId), dto, imagen);
  }

  @Get('listadoUsuarios')
  obtenerListadoUsuarios() {
    return this.usuariosService.listarUserNames();
  }

  @Get(':id') //perfil de otro usuario
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
