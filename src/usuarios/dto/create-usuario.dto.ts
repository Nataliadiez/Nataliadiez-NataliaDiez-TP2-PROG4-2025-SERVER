import { IsNotEmpty, IsNumberString, IsString, IsDateString, IsEmail, IsIn } from 'class-validator';

//lo que se manda por Postman
export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsDateString()
  fechaNacimiento: Date;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  imagenPerfil: any;

  @IsNotEmpty()
  @IsIn(['administrador', 'usuario'])
  perfil: string;
}
