import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

void bootstrap();
