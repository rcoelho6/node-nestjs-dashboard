import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../shared/config/services/config.service';
import { CustomHttpService } from '../../shared/custom.http/services/custom.http.service';
import { AppDto, IntegrationDto, DomainDto } from '../dtos';
import { throwNotFoundExceptionIfStatusIs404, throwInternalServerErrorIfNotSuccess } from '../../shared/custom.http/helpers/helper.functions';

@Injectable()
export class AppsService {

  constructor(private http: CustomHttpService, private configService: ConfigService) {
    this.http.baseUrl = this.configService.credentialBaseUrl;
  }

  async getByCustomer(customerId: string): Promise<AppDto[]> {
    const response = await this.http.get<AppDto[]>(`/customer/${customerId}/apps`);
    const apss = response.data;

    throwNotFoundExceptionIfStatusIs404(response, `Customer with id "${customerId}" not found`);
    throwInternalServerErrorIfNotSuccess(response);

    return apss;
  }

  async getIntegrationsByAppId(customerId: string, appName: string): Promise<IntegrationDto[]> {
    const response = await this.http.get<IntegrationDto[]>(`/customer/${customerId}/apps/${appName}/integrations`);
    const integrations = response.data;

    throwNotFoundExceptionIfStatusIs404(response, `Customer with id "${customerId}" and app name "${appName}" not found`);
    throwInternalServerErrorIfNotSuccess(response);

    return integrations;
  }

  async getDomainsByIntegrationId(customerId: string, appName: string, integrationId: string): Promise<DomainDto[]> {
    const response = await this.http.get<DomainDto[]>(`/customer/${customerId}/apps/${appName}/integrations/${integrationId}/domains`);
    const domains = response.data;

    throwNotFoundExceptionIfStatusIs404(
      response,
      `Customer with id "${customerId}", app name "${appName}" and integration "${integrationId}" not found`,
    );
    throwInternalServerErrorIfNotSuccess(response);

    return domains;
  }
}
