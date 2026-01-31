import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000', // Nuxt
    credentials: true,
  });

  console.log(`Nest is running on port ${process.env.PORT}`)
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
