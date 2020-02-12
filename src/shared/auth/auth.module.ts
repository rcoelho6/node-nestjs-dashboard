import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './strategies/keycloak.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  providers: [KeycloakStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
