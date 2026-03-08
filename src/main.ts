import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';
import * as fs from 'fs';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (!isVercel) {
    // LOGIKA LOCAL
    const uploadDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    app.useStaticAssets(uploadDir, {
      prefix: '/uploads/',
      setHeaders: (res) => { res.set('Access-Control-Allow-Origin', '*'); },
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Local: http://localhost:${port}/api`);
  } else {
    // LOGIKA VERCEL
    await app.init();
  }
  
  return app;
}

// Jalankan otomatis hanya jika di local
if (process.env.VERCEL !== '1') {
  bootstrap();
}