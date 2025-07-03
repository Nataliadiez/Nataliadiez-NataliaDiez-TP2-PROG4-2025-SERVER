import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacione } from 'src/publicaciones/entities/publicacione.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EstadisticasService {
  constructor(@InjectModel(Publicacione.name) private publicacionModel: Model<Publicacione>) {}
  async contarPublicacionesPorUsuario(desde: string, hasta: string): Promise<any[]> {
    const desdeFecha = new Date(desde);
    const hastaFecha = new Date(hasta);
    hastaFecha.setHours(23, 59, 59, 999);

    const resultado = await this.publicacionModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: desdeFecha,
            $lte: hastaFecha,
          },
        },
      },
      {
        $group: {
          _id: '$autor',
          total: { $sum: 1 },
        },
      },
      {
        $addFields: {
          _id: { $toObjectId: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      {
        $unwind: '$usuario',
      },
      {
        $project: {
          nombre: '$usuario.userName',
          total: 1,
        },
      },
    ]);

    return resultado || [];
  }

  async contarComentariosPorTiempo(desde: string, hasta: string): Promise<any> {
    const desdeFecha = new Date(desde);
    const hastaFecha = new Date(hasta);
    hastaFecha.setHours(23, 59, 59, 999);

    const resultado = await this.publicacionModel.aggregate([
      { $unwind: '$comentarios' },
      {
        $match: {
          'comentarios.fecha': {
            $gte: desdeFecha,
            $lte: hastaFecha,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$comentarios.fecha' },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    console.log(resultado);
    return resultado || [];
  }

  async contarComentariosPorPublicacion(desde: string, hasta: string): Promise<any> {
    const desdeFecha = new Date(desde);
    const hastaFecha = new Date(hasta);
    hastaFecha.setHours(23, 59, 59, 999);

    const resultado = await this.publicacionModel.aggregate([
      { $unwind: '$comentarios' },
      {
        $match: {
          'comentarios.fecha': {
            $gte: desdeFecha,
            $lte: hastaFecha,
          },
        },
      },
      {
        $group: {
          _id: '$titulo',
          cantidadComentarios: { $sum: 1 },
        },
      },
      {
        $sort: { cantidadComentarios: -1 },
      },
      {
        $project: {
          titulo: '$_id',
          cantidadComentarios: 1,
          _id: 0,
        },
      },
    ]);
    return resultado || [];
  }
}
