import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Create app with logging enabled
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Enable CORS for the React Native Expo app
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  
  // Add global request logging middleware
  app.use((req, res, next) => {
    const logger = new Logger('HTTP');
    logger.log(`${req.method} ${req.originalUrl}`);
    
    // Log request body for POST/PUT requests (redact sensitive data)
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }
    
    next();
  });
  
  // Add global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
  
  // Add global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const config = new DocumentBuilder()
    .setTitle('OptiFit API')
    .setDescription('API documentation for the OptiFit app')
    .setVersion('1.0')
    .addTag('optifit')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  await app.listen(3000);
  Logger.log(`Application is running on: http://localhost:3000`, 'Bootstrap');
}
bootstrap();
