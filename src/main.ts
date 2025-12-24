import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Parent-in API')
    .setDescription('API para la aplicación Parent-in - Sistema de apoyo para padres y madres')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', // Este nombre se usará en los controladores
    )
    .addTag('app', 'Endpoints generales de la aplicación')
    .addTag('auth', 'Endpoints de autenticación y autorización')
    .addTag('users', 'Endpoints de gestión de usuarios')
    .addTag('onboarding', 'Endpoints del proceso de onboarding')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Solo habilitar Swagger en desarrollo, a menos que se especifique lo contrario
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Parent-in API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
