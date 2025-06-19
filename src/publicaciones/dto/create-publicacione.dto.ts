import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePublicacioneDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  mensaje: string;

  @IsOptional()
  @IsString()
  imagen?: any;
}
