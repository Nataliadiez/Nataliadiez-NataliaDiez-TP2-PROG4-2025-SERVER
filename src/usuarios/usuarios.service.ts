import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Publicacione } from '../publicaciones/entities/publicacione.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(Publicacione.name) private publicacionModel: Model<Publicacione>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuarioExistente = await this.usuarioModel.findOne({
      $or: [{ email: createUsuarioDto.email }, { userName: createUsuarioDto.userName }],
    });

    if (usuarioExistente) {
      if (usuarioExistente.email === createUsuarioDto.email) {
        throw new ConflictException('El email ya está registrado');
      }
      if (usuarioExistente.userName === createUsuarioDto.userName) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, saltRounds);
    const instancia = new this.usuarioModel({
      nombre: createUsuarioDto.nombre,
      apellido: createUsuarioDto.apellido,
      email: createUsuarioDto.email,
      userName: createUsuarioDto.userName,
      password: hashedPassword,
      fechaNacimiento: createUsuarioDto.fechaNacimiento,
      descripcion: createUsuarioDto.descripcion,
      imagenPerfil: createUsuarioDto.imagenPerfil,
      perfil: createUsuarioDto.perfil,
    });
    const guardado = await instancia.save();
    return guardado;
  }

  async findAll(incluirInactivos = false) {
    const filtro = incluirInactivos ? {} : { estado: true };
    const usuarios = await this.usuarioModel.find(filtro);
    if (!usuarios.length) {
      throw new NotFoundException('No hay usuarios disponibles');
    }
    return usuarios;
  }

  async findOne(id: string) {
    const uno = await this.usuarioModel.findById(id);
    if (!uno || uno.estado === false) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return uno as Usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const editado = await this.usuarioModel.updateOne(
      { _id: id },
      {
        nombre: updateUsuarioDto.nombre,
        apellido: updateUsuarioDto.apellido,
        email: updateUsuarioDto.email,
        userName: updateUsuarioDto.userName,
        password: updateUsuarioDto.password,
        fechaNacimiento: updateUsuarioDto.fechaNacimiento,
        descripcion: updateUsuarioDto.descripcion,
        imagenPerfil: updateUsuarioDto.imagenPerfil,
      },
    );

    return editado;
  }

  async remove(id: string) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const eliminado = await this.usuarioModel.updateOne({ _id: id }, { estado: false });
    return eliminado;
  }

  async obtenerPerfilyPosts(usuarioId: string) {
    const usuario = await this.usuarioModel.findById(usuarioId).select('-password');
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const publicaciones = await this.publicacionModel
      .find({ autor: usuarioId, estado: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('autor', 'userName imagenPerfil')
      .populate('comentarios.usuario', 'userName imagenPerfil');

    return { usuario, publicaciones };
  }

  async listarUserNames() {
    const usuarios = await this.usuarioModel.find(
      { perfil: 'usuario', estado: true },
      { userName: 1, _id: 1 },
    );

    if (!usuarios.length) {
      throw new NotFoundException('No hay usuarios disponibles');
    }

    return usuarios;
  }

  async actualizarPerfil(id: string, dto: UpdateUsuarioDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    try {
      if (imagen) {
        usuario.imagenPerfil = `/images/${imagen.filename}`;
      }

      usuario.userName = dto.userName || usuario.userName;
      usuario.email = dto.email || usuario.email;
      usuario.descripcion = dto.descripcion || usuario.descripcion;

      await usuario.save();
      return usuario;
    } catch (error) {
      throw new ConflictException('Error al actualizar el perfil: ' + error.message);
    }
  }

  async reactivarUsuario(userId: string) {
    const usuario = await this.usuarioModel.findById(userId);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.estado = true;
    await usuario.save();
    return usuario;
  }
}
