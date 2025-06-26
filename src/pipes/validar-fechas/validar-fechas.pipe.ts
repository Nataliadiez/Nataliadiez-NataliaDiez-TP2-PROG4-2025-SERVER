import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

interface FechasDto {
  desde: string;
  hasta: string;
}

@Injectable()
export class ValidarFechasPipe implements PipeTransform {
  transform(value: FechasDto, metadata: ArgumentMetadata): FechasDto {
    const { desde, hasta } = value;

    if (!desde || !hasta) {
      throw new BadRequestException('Faltan las fechas "desde" y/o "hasta".');
    }
    const desdeFecha = new Date(desde);
    const hastaFecha = new Date(hasta);

    if (isNaN(desdeFecha.getTime()) || isNaN(hastaFecha.getTime())) {
      throw new BadRequestException('Fechas inválidas.');
    }

    if (desdeFecha > hastaFecha) {
      throw new BadRequestException('"Desde" no puede ser mayor que "hasta"');
    }

    return value;
  }
}
