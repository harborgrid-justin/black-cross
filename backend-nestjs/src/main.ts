import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(AppConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Black-Cross API')
    .setDescription('Enterprise Cyber Threat Intelligence Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Start server
  const port = configService.app.port;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                      BLACK-CROSS                             ║
║          Enterprise Cyber Threat Intelligence Platform       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🚀 Server running on port ${port}
📍 API: http://localhost:${port}/api/v1
💚 Health: http://localhost:${port}/health
📚 Docs: http://localhost:${port}/api/v1/docs

Environment: ${configService.app.env}
Status: Operational
  `);
}

// Start the application
void bootstrap();
