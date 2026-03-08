import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Tambahkan variabel untuk mengecek apakah sedang di Vercel
const isVercel = process.env.VERCEL === '1';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setGlobalPrefix('api');

    // ============================================================
    // 1. PASTIKAN FOLDER UPLOADS ADA (Hanya dijalankan jika BUKAN di Vercel)
    // ============================================================
    if (!isVercel) {
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Folder uploads berhasil dibuat otomatis.');
      }

      app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
        setHeaders: (res) => {
          res.set('Access-Control-Allow-Origin', '*');
        },
      });
    }

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

    // ============================================================
    // LOGIKA STARTING SERVER
    // ============================================================
    if (!isVercel) {
      // Jika di Local (PC), jalankan listen secara normal
      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
      await app.listen(port, '0.0.0.0');

      const interfaces = os.networkInterfaces();
      let localIp = 'localhost';
      for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name] || []) {
          if (net.family === 'IPv4' && !net.internal) {
            localIp = net.address;
            break;
          }
        }
      }

      console.log(`🚀 Backend ZieSen running:`);
      console.log(`👉 Local   : http://localhost:${port}/api`);
      console.log(`👉 Network : http://${localIp}:${port}/api`);
      console.log(`👉 Static  : http://localhost:${port}/uploads/ (Akses Foto)`);
    } else {
      // Jika di Vercel, cukup inisialisasi aplikasi (Vercel yang akan handle port)
      await app.init();
      return (app as any).getHttpAdapter().getInstance();
    }

  } catch (err) {
    console.error('❌ Error starting server:', err);
    if (!isVercel) process.exit(1);
  }
}

// Export bootstrap untuk kebutuhan Vercel (jika file index.ts kamu memanggil file ini)
export const viteNodeApp = bootstrap();

// Jalankan bootstrap
bootstrap();