import { PublicacionesGateway } from './publicaciones.gateway';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { UpdatePublicacioneDto } from './dto/update-publicacione.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacione } from './entities/publicacione.entity';
import { Model, ObjectId, SortOrder } from 'mongoose';
import { Types } from 'mongoose';
import { FilterQuery } from 'mongoose';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacione.name) private publicacionModel: Model<Publicacione>,
    private readonly publicacionesGateway: PublicacionesGateway,
  ) {}

  async create(
    createPublicacioneDto: CreatePublicacioneDto,
    autorId: string,
    imagen?: Express.Multer.File,
  ) {
    const imagenUrl = imagen?.filename ? `/images/${imagen.filename}` : undefined;
    if (!createPublicacioneDto.titulo || !createPublicacioneDto.mensaje) {
      throw new BadRequestException('El título y el mensaje son obligatorios.');
    }
    const instancia = new this.publicacionModel({
      titulo: createPublicacioneDto.titulo,
      mensaje: createPublicacioneDto.mensaje,
      imagen: imagenUrl,
      autor: autorId,
    });

    const guardado = await instancia.save();
    const conAutor = await this.publicacionModel
      .findById(guardado._id)
      .populate('autor', 'userName imagenPerfil')
      .populate('comentarios.usuario', 'userName imagenPerfil');

    this.publicacionesGateway.emitirNuevaPublicacion(conAutor);
    return conAutor;
  }

  async findAll(skip = 0, limit = 5, orden = 'createdAt', autorId?: string) {
    const sortKey = orden === 'likes' ? 'likesCount' : 'createdAt';
    const filtro: FilterQuery<Publicacione> = { estado: true };
    if (autorId) {
      filtro.autor = autorId;
    }
    const publicaciones = await this.publicacionModel
      .find(filtro)
      .sort({ [sortKey]: -1 })
      .skip(skip)
      .limit(limit)
      .populate('autor', 'userName imagenPerfil');

    return publicaciones;
  }

  async findInactivas() {
    return this.publicacionModel
      .find({ estado: false })
      .sort({ updatedAt: -1 })
      .populate('autor', 'userName imagenPerfil');
  }

  async findInactivasPorUsuario(usuarioId: string) {
    return this.publicacionModel
      .find({ estado: false, autor: usuarioId })
      .sort({ updatedAt: -1 })
      .populate('autor', 'userName imagenPerfil');
  }

  async findOne(id: string) {
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    return publicacion as Publicacione;
  }

  async update(id: string, body: any, imagen: Express.Multer.File) {
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    if (!body.titulo && !body.mensaje && !imagen && body.estado === undefined) {
      throw new BadRequestException('No se recibió ningún dato para actualizar.');
    }

    if (body.titulo) publicacion.titulo = body.titulo;
    if (body.mensaje) publicacion.mensaje = body.mensaje;

    if (imagen) {
      publicacion.imagen = `/images/${imagen.filename}`;
    }

    if (body.estado !== undefined) {
      publicacion.estado = body.estado === 'true' || body.estado === true;
    }

    await publicacion.save();
    this.publicacionesGateway.emitirActualizacionPublicacion(publicacion);
    return publicacion;
  }

  async remove(id: string, usuarioId: string, esAdmin: boolean) {
    const publicacion = await this.publicacionModel.findById(id);

    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    const autorId = publicacion.autor as Types.ObjectId;

    if (!esAdmin && autorId?.toString() !== usuarioId) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
    }

    publicacion.estado = false;
    await publicacion.save();

    this.publicacionesGateway.emitirEliminacionPublicacion(publicacion);
    return { message: 'Publicación desactivada' };
  }

  async toggleLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    const usuarioObjectId = new Types.ObjectId(usuarioId);
    const yaDioLike = publicacion.likes.find((id) => id.toString() === usuarioId) !== undefined;

    if (yaDioLike) {
      publicacion.likes = publicacion.likes.filter((id) => id.toString() !== usuarioId);
    } else {
      publicacion.likes.push(usuarioObjectId);
    }

    publicacion.likesCount = publicacion.likes.length;

    await publicacion.save();
    return publicacion;
  }

  async agregarComentario(publicacionId: string, usuarioId: string, contenido: string) {
    const comentario = {
      usuario: new Types.ObjectId(usuarioId),
      contenido,
      fecha: new Date(),
    };

    const actualizada = await this.publicacionModel
      .findByIdAndUpdate(publicacionId, { $push: { comentarios: comentario } }, { new: true })
      .populate({
        path: 'comentarios.usuario',
        select: 'userName imagenPerfil',
      });

    if (!actualizada) throw new NotFoundException('Publicación no encontrada');

    const comentarioAgregado = actualizada.comentarios.at(-1);

    this.publicacionesGateway.emitirNuevoComentario(publicacionId, comentarioAgregado);

    return comentarioAgregado;
  }

  async obtenerComentarios(publicacionId: string, skip: number, limit: number) {
    const publicacion = await this.publicacionModel
      .findById(publicacionId)
      .select('comentarios')
      .populate({
        path: 'comentarios.usuario',
        select: 'userName imagenPerfil',
      });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const comentariosOrdenados = publicacion.comentarios.sort(
      (a, b) => b.fecha.getTime() - a.fecha.getTime(),
    );

    const comentariosPaginados = comentariosOrdenados.slice(skip, skip + limit);

    return comentariosPaginados;
  }
}
