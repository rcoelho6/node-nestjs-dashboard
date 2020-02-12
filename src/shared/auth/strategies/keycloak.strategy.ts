import { Injectable, HttpService } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

import { ConfigService } from '../../config/services/config.service';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private http: HttpService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true, // To prevent a call to be made each time a signing key needs to be retrieved. The cache uses the kid.
        rateLimit: true, // To prevent attackers to send many random kid.
        jwksUri: `${configService.ssoURL}/auth/realms/${configService.ssoRealm}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: `${configService.ssoURL}/auth/realms/${configService.ssoRealm}`,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  async validate({ headers }: any, payload: any) {
    const token = headers.authorization.split(' ')[1];
    const options = {
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'},
    };

    const url = `${this.configService.ssoURL}/auth/realms/${this.configService.ssoRealm}/protocol/openid-connect/userinfo`;

    try {
      await this.http.get(url, options).toPromise();
      return payload;
    } catch (error) {
      return null;
    }

  }
}
