import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
export class ConfigService {
  constructor() {
    dotenv.config();
  }

  private get(key: string): any {
    const value: any = process.env[key];
    if (!isNaN(value) || (value === 'true' || value === 'false')) {
      return JSON.parse(value);
    }
    return value;
  }

  public get serverPort(): number {
    return this.get('SERVER_PORT');
  }

  public get credentialBaseUrl(): string {
    return this.get('CREDENTIAL_BASE_URL');
  }

  public get nodeEnv(): string {
    return this.get('NODE_ENV');
  }

  public get isDevEnvironment(): boolean {
    return this.nodeEnv === 'development';
  }

  public get ssoURL(): string {
    return this.get('SSO_URL');
  }

  public get ssoRealm(): string {
    return this.get('SSO_REALM');
  }

  public get ssoClientID(): string {
    return this.get('SSO_CLIENT_ID');
  }

  public get ssoSiteURL(): string {
    return this.get('SSO_SITE_URL');
  }

}
