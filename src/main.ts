import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add middleware to handle ngrok headers for all requests (including preflight)
  app.use((req, res, next) => {
    // Add ngrok headers to bypass warning page
    res.header('ngrok-skip-browser-warning', 'true');

    // Handle preflight requests explicitly
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, ngrok-skip-browser-warning',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(200).end();
      return;
    }
    next();
  });

  // Enable CORS for Flutter web app
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all localhost origins for development
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
    ],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
