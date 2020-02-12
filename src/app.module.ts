import { Module } from '@nestjs/common';
import { ConfigModule } from './shared/config/config.module';
import { AuthModule } from './shared/auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { CustomHttpModule } from './shared/custom.http/custom.http.module';
import { AppsModule } from './apps/apps.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CustomersModule,
    CustomHttpModule,
    AppsModule,
  ],
})
export class AppModule {}
