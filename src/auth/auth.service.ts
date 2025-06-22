import { ObjectId } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { sign, decode, verify, JwtPayload } from 'jsonwebtoken';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private secreto: string;
  private expiracion: any;

  constructor(
    private readonly usuariosService: UsuariosService,
    private configService: ConfigService,
  ) {
    const secreto = this.configService.get<string>('JWT_SECRET');
    if (!secreto) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    this.expiracion = this.configService.get<string>('JWT_EXPIRACION') || '15m';
    this.secreto = secreto;
  }

  async registrar(body: CreateUsuarioDto, imagenPerfil: Express.Multer.File, perfil: string) {
    try {
      if (!imagenPerfil) {
        throw new BadRequestException('La imagen de perfil es obligatoria');
      }

      const imagenUrl = `/images/${imagenPerfil.filename}`;
      const nuevoUsuario = await this.usuariosService.create({
        ...body,
        imagenPerfil: imagenUrl,
        perfil: perfil,
      });

      return {
        token: this.crearToken(nuevoUsuario._id, nuevoUsuario.nombre, nuevoUsuario.perfil),
        usuario: {
          id: nuevoUsuario._id,
          nombre: nuevoUsuario.nombre,
          userName: nuevoUsuario.userName,
          email: nuevoUsuario.email,
        },
      };
    } catch (error) {
      console.error('Error en el registro:', error);
      throw new InternalServerErrorException('No se pudo completar el registro');
    }
  }

  async loguear(body: any) {
    try {
      const { email, userName, password } = body;
      const usuarios = await this.usuariosService.findAll();

      const usuario = usuarios.find((u) => u.email === email || u.userName === userName);

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      const passwordMatch = await bcrypt.compare(String(password), usuario.password);

      if (!passwordMatch) throw new UnauthorizedException('Contraseña incorrecta');

      return {
        token: this.crearToken(usuario._id, usuario.nombre, usuario.perfil),
        usuario,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  traerDatos(token: string) {
    try {
      const payload = verify(token, this.secreto);
      return payload;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  crearToken(id: any, nombre: string, perfil: string) {
    try {
      const payload = { id, nombre, perfil };

      return sign(payload, this.secreto, {
        algorithm: 'HS256',
        expiresIn: this.expiracion,
      });
    } catch (error) {
      console.error('Error al generar token:', error);
      throw new InternalServerErrorException('No se pudo generar el token');
    }
  }

  refrescarToken(token: string) {
    try {
      const payload = verify(token, this.secreto) as JwtPayload;

      const nuevoToken = sign(
        {
          id: payload.id,
          nombre: payload.nombre,
          perfil: payload.perfil,
        },
        this.secreto,
        { expiresIn: this.expiracion },
      );

      return { token: nuevoToken };
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
