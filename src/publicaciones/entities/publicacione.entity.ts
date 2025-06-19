import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Schema()
export class Publicacione {
  _id?: ObjectId;

  @Prop({ required: true, type: String })
  titulo: string;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId | Usuario;

  @Prop({ required: true, type: String })
  mensaje: string;

  @Prop()
  imagen?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Usuario', default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Boolean, default: true })
  estado: boolean;

  @Prop({
    type: [
      {
        usuario: { type: Types.ObjectId, ref: 'Usuario' },
        contenido: String,
        fecha: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comentarios: {
    usuario: Types.ObjectId;
    contenido: string;
    fecha: Date;
  }[];
}

export const PublicacioneSchema = SchemaFactory.createForClass(Publicacione);
