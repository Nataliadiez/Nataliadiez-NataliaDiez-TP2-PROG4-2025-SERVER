import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si llega algo no permitido
      transform: true, // Transforma el JSON en instancia de clase
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public')); //exponer la carpeta public para imagenes
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
