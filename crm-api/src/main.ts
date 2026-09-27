import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: 'http://localhost:8443',
});

  const config = new DocumentBuilder()
  .setTitle('Mini CRM API')
  .setDescription('API para gerenciamento de clientes, contatos e oportunidades')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(

   new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        }),

  );
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();







