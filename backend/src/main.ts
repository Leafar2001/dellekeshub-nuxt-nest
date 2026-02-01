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

  const port = process.env.PORT || 3001;

  console.log(`Nest is running on port ${port}`);
  await app.listen(port);
}
bootstrap();
