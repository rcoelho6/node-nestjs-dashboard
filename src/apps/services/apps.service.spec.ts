import { Test, TestingModule } from '@nestjs/testing';
import { AppsService } from './apps.service';
import { AppDto } from '../dtos/app.dto';
import { ConfigService } from '../../shared/config/services/config.service';
import { CustomHttpService } from '../../shared/custom.http/services/custom.http.service';
import { createMockHttpResponse } from '../../shared/custom.http/helpers/helper.functions';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IntegrationDto } from '../dtos/integration.dto';
import { DomainDto } from '../dtos/domain.dto';

const mockCustomHttpService = () => ({
  get: jest.fn(),
});

const mockConfigService = () => ({
  credentialBaseUrl: jest.fn(),
});

describe('AppsService', () => {
  let service: AppsService;
  let http: CustomHttpService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppsService],
      providers: [
        {
          provide: CustomHttpService,
          useFactory: mockCustomHttpService,
        },
        {
          provide: ConfigService,
          useFactory: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppsService>(AppsService);
    http = module.get<CustomHttpService>(CustomHttpService);
    config = module.get<ConfigService>(ConfigService);
  });

  describe('getByCustomer', () => {
    it('should get all apps for customers successfuly', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const expected: AppDto[] = [expect.any(AppDto), expect.any(AppDto), expect.any(AppDto)];
      const httpResult = createMockHttpResponse<AppDto[]>(expected, 200, 'OK');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const result = await service.getByCustomer(customerId);

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps`);
      expect(result).toEqual(expected);
    });

    it('should thrown a internal server error', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const expected: AppDto[] = [];
      const httpResult = createMockHttpResponse<AppDto[]>(expected, 401, 'Refuse');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const action = () => service.getByCustomer(customerId);

      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps`);
    });

    it('should thrown a not found exception', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const expected: AppDto[] = [];
      const httpResult = createMockHttpResponse<AppDto[]>(expected, 404, 'Refuse');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const action = () => service.getByCustomer(customerId);

      await expect(action()).rejects.toThrow(NotFoundException);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps`);
    });
  });

  describe('getBgetIntegrationsByAppIdyCustomer', () => {
    it('should get all apps for customers successfuly', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const expected: IntegrationDto[] = [expect.any(IntegrationDto), expect.any(IntegrationDto), expect.any(IntegrationDto)];
      const httpResult = createMockHttpResponse<IntegrationDto[]>(expected, 200, 'OK');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const result = await service.getIntegrationsByAppId(customerId, appName);

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps/${appName}/integrations`);
      expect(result).toEqual(expected);
    });

    it('should thrown a internal server error', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const expected: IntegrationDto[] = [];
      const httpResult = createMockHttpResponse<IntegrationDto[]>(expected, 401, 'Refuse');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const action = () => service.getIntegrationsByAppId(customerId, appName);

      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps/${appName}/integrations`);
    });

    it('should thrown a not found exception', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const expected: IntegrationDto[] = [];
      const httpResult = createMockHttpResponse<IntegrationDto[]>(expected, 404, 'Refuse');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const action = () => service.getIntegrationsByAppId(customerId, appName);

      await expect(action()).rejects.toThrow(NotFoundException);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps/${appName}/integrations`);
    });
  });

  describe('getBgetIntegrationsByAppIdyCustomer', () => {
    it('should get all apps for customers successfuly', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const integrationId = 'ab1b76a8-0b63-4d37-9eba-cd63f6415726';
      const expected: DomainDto[] = [expect.any(DomainDto), expect.any(DomainDto), expect.any(DomainDto)];
      const httpResult = createMockHttpResponse<DomainDto[]>(expected, 200, 'OK');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const result = await service.getDomainsByIntegrationId(customerId, appName, integrationId);

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps/${appName}/integrations/${integrationId}/domains`);
      expect(result).toEqual(expected);
    });

    it('should thrown a internal server error', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const integrationId = 'ab1b76a8-0b63-4d37-9eba-cd63f6415726';
      const expected: DomainDto[] = [];
      const httpResult = createMockHttpResponse<DomainDto[]>(expected, 401, 'Refuse');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const action = () => service.getDomainsByIntegrationId(customerId, appName, integrationId);

      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps/${appName}/integrations/${integrationId}/domains`);
    });

    it('should thrown a not found exception', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const integrationId = 'ab1b76a8-0b63-4d37-9eba-cd63f6415726';
      const expected: DomainDto[] = [];
      const httpResult = createMockHttpResponse<DomainDto[]>(expected, 404, 'Refuse');

      jest.spyOn(http, 'get').mockResolvedValue(httpResult);

      const action = () => service.getDomainsByIntegrationId(customerId, appName, integrationId);

      await expect(action()).rejects.toThrow(NotFoundException);
      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith(`/customer/${customerId}/apps/${appName}/integrations/${integrationId}/domains`);
    });
  });
});
