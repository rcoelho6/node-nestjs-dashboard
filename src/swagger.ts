import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CustomersModule } from './customers/customers.module';
import { AppsModule } from './apps/apps.module';

export function useSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('AllowMe Dashboard Admin API')
    .setDescription('This API provides services to AllowMe Dashboard Admin')
    .setVersion('1.0')
    .setSchemes('http', 'https')
    .addBearerAuth('Authorization', 'header')
    .build();
  SwaggerModule.setup('documentation/', app, SwaggerModule.createDocument(app, options, {
    include: [
      AppsModule,
      CustomersModule,
    ],
  }));
}
