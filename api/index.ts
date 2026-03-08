import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

// Inisialisasi Express
const server = express();

// Variable untuk menampung instance Nest
let cachedApp: any;

export default async (req: any, res: any) => {
  if (!cachedApp) {
    // Membuat instance NestJS dengan Express Adapter
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    // 1. Tambahkan Global Prefix agar sesuai dengan route '/api'
    app.setGlobalPrefix('api');

    // 2. Aktifkan Validation Pipe agar absensi tidak error saat kirim data
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 3. Konfigurasi CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Inisialisasi aplikasi
    await app.init();
    
    // Simpan instance express ke cache
    cachedApp = server;
  }

  // Jalankan request
  return cachedApp(req, res);
};