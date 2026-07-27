import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: new ConsoleLogger({
      prefix: 'DellekesHub',
      logLevels: ['log', 'error', 'warn', 'debug'],
      timestamp: true,
    }),
  });

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 8080;

  console.log(`Nest is running on port ${port}`);
  await app.listen(port);
}

void bootstrap();
