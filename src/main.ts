import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from './shared/config/services/config.service';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './shared/all-exceptions.filter';
import { useSwagger } from './swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'build'));

  app.use(helmet());

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  useSwagger(app);

  const configService: ConfigService = app.get(ConfigService);
  await app.listen(configService.serverPort);
}

bootstrap();
