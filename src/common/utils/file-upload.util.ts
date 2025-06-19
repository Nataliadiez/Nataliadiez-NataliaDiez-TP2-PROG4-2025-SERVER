import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const imageFileFilter = (
  req: any,
  file: { originalname: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(String(file.originalname)).toLowerCase();
  const extPermitida = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  if (extPermitida.includes(ext)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Sólo se permiten archivos de imagen'), false);
  }
};

export const imageFileLimits = {
  fileSize: 2 * 1024 * 1024,
};
