import { Module } from '@nestjs/common';
import { ConfigModule } from '../shared/config/config.module';
import { CustomHttpModule } from '../shared/custom.http/custom.http.module';
import { CustomerService } from './services/customer.service';
import { CustomersController } from './controllers/customers.controller';

@Module({
  imports: [
    ConfigModule,
    CustomHttpModule,
  ],
  controllers: [CustomersController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomersModule {}
