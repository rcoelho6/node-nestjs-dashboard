import { Test, TestingModule } from '@nestjs/testing';
import { AppsController } from './apps.controller';
import { AppDto } from '../dtos/app.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { AppsService } from '../services/apps.service';
import { IntegrationDto } from '../dtos/integration.dto';
import { DomainDto } from '../dtos/domain.dto';

const mockService = () => ({
  getByCustomer: jest.fn(),
  getIntegrationsByAppId: jest.fn(),
  getDomainsByIntegrationId: jest.fn(),
});

describe('AppsController', () => {
  let controller: AppsController;
  let service: AppsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppsController],
      providers: [
        {
          provide: AppsService,
          useFactory: mockService,
        },
      ],
    }).compile();

    controller = module.get<AppsController>(AppsController);
    service = module.get<AppsService>(AppsService);
  });

  describe('getByCustomer', () => {
    it('should get all apps for customers successfuly', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const expected: AppDto[] = [expect.any(AppDto), expect.any(AppDto), expect.any(AppDto)];

      jest.spyOn(service, 'getByCustomer').mockResolvedValue(expected);

      const result = await controller.getByCustomer(customerId);

      expect(service.getByCustomer).toHaveBeenCalledTimes(1);
      expect(service.getByCustomer).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(expected);
    });

    it('should thrown a not found exception', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';

      jest.spyOn(service, 'getByCustomer').mockRejectedValue(new InternalServerErrorException());

      const action = () => controller.getByCustomer(customerId);

      await expect(action()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getIntegrationsByAppId', () => {
    it('should get all integrations for app successfuly', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const expected: IntegrationDto[] = [expect.any(IntegrationDto), expect.any(IntegrationDto), expect.any(IntegrationDto)];

      jest.spyOn(service, 'getIntegrationsByAppId').mockResolvedValue(expected);

      const result = await controller.getIntegrationsByAppId(customerId, appName);

      expect(service.getIntegrationsByAppId).toHaveBeenCalledTimes(1);
      expect(service.getIntegrationsByAppId).toHaveBeenCalledWith(customerId, appName);
      expect(result).toEqual(expected);
    });

    it('should thrown a not found exception', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';

      jest.spyOn(service, 'getIntegrationsByAppId').mockRejectedValue(new InternalServerErrorException());

      const action = () => controller.getIntegrationsByAppId(customerId, appName);

      await expect(action()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getDomainsByIntegrationId', () => {
    it('should get all domains for app integration', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const integrationId = 'ab1b76a8-0b63-4d37-9eba-cd63f6415726';
      const expected: DomainDto[] = [expect.any(DomainDto), expect.any(DomainDto), expect.any(DomainDto)];

      jest.spyOn(service, 'getDomainsByIntegrationId').mockResolvedValue(expected);

      const result = await controller.getDomainsByIntegrationId(customerId, appName, integrationId);

      expect(service.getDomainsByIntegrationId).toHaveBeenCalledTimes(1);
      expect(service.getDomainsByIntegrationId).toHaveBeenCalledWith(customerId, appName, integrationId);
      expect(result).toEqual(expected);
    });

    it('should thrown a not found exception', async () => {
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const appName = 'app.test.1';
      const integrationId = 'ab1b76a8-0b63-4d37-9eba-cd63f6415726';

      jest.spyOn(service, 'getDomainsByIntegrationId').mockRejectedValue(new InternalServerErrorException());

      const action = () => controller.getDomainsByIntegrationId(customerId, appName, integrationId);

      await expect(action()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
