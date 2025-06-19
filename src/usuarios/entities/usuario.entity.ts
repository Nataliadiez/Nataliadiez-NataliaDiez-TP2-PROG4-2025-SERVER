import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
  _id?: ObjectId; //sin prop cuando es opcional

  @Prop({ required: true, type: String })
  nombre: string;

  @Prop({ required: true, type: String })
  apellido: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String, unique: true })
  userName: string;

  @Prop({ required: true, type: Date })
  fechaNacimiento: Date;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  descripcion: string;

  @Prop()
  imagenPerfil: string;

  @Prop({ type: Boolean, default: true })
  estado: boolean;

  @Prop({ default: 'usuario' })
  perfil: 'usuario' | 'administrador';
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
