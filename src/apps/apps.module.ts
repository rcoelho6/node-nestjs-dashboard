import { Module } from '@nestjs/common';
import { AppsController } from './controllers/apps.controller';
import { AppsService } from './services/apps.service';
import { ConfigModule } from '../shared/config/config.module';
import { CustomHttpModule } from '../shared/custom.http/custom.http.module';

@Module({
  imports: [
    ConfigModule,
    CustomHttpModule,
  ],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
