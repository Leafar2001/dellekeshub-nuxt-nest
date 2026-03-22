import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import session from 'express-session';
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'DellekesHub',
      logLevels: ['log', 'error', 'warn', 'debug'],
      timestamp: true,
    }),
  });

  if (process.env.NODE_ENV !== 'prod') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DellekesHub API')
      .setDescription('Video streaming platform API')
      .setVersion('1.0')
      .addCookieAuth('sid', { type: 'apiKey', in: 'cookie' }, 'session')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('collections', 'Movie and series collections')
      .addTag('media', 'Unified media endpoints')
      .addTag('likes', 'Like/unlike media')
      .addTag('watchlist', 'User watchlist')
      .addTag('profiles', 'User profiles')
      .addTag('reviews', 'Media reviews')
      .addTag('progress', 'Watch progress tracking')
      .addTag('stream', 'Video streaming')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document));
  }

  app.use(
    session({
      name: 'sid',
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,

      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI!,
        collectionName: 'sessions',
        ttl: 60 * 60 * 24 * 7,
      }),

      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'prod',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
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

void bootstrap();
