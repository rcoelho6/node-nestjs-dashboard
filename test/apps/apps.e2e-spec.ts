import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { AllExceptionsFilter } from '../../src/shared/all-exceptions.filter';
import { CustomHttpService } from '../../src/shared/custom.http/services/custom.http.service';
import { createMockHttpResponse } from '../../src/shared/custom.http/helpers/helper.functions';
import { AppDto, IntegrationDto, DomainDto } from '../../src/apps/dtos';

describe('AppsController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  const customHttpService = {
    baseUrl: '',
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };

  const createApp = async ({mockAuth}: {mockAuth: boolean}) => {
    let builder: TestingModuleBuilder = Test
      .createTestingModule({
        imports: [AppModule],
      })
      .overrideProvider(CustomHttpService)
      .useValue(customHttpService);

    if (mockAuth) {
      builder = builder
        .overrideGuard(AuthGuard('jwt'))
        .useValue({
          canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = { id: 'c0c94ec8-262a-4348-a732-b57531b4fca8' };
            return true;
          },
        });
      }

    const moduleFixture: TestingModule = await builder.compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter('none'));
    app.useGlobalPipes(new ValidationPipe());
    return app;
  };

  beforeEach(async () => {
    app = await createApp({mockAuth: true});
    server = app.getHttpServer();
    await app.init();
  });

  describe('List All Apps for a Costumer - GET /api/v1/customers/{customerId}/apps', () => {
    it('success - should return status 200 with apps list filled', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const apps: AppDto[] = [
        {
          customerId,
          appName: 'app.test.1',
          integrationCount: 1,
          active: true,
        },
        {
          customerId,
          appName: 'app.test.2',
          integrationCount: 3,
          active: false,
        },
      ];

      const mockResponse = createMockHttpResponse<AppDto[]>(apps, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps`)
        .expect(200, apps);
    });

    it('success - should return status 200 with empty list', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const apps: AppDto[] = [];

      const mockResponse = createMockHttpResponse<AppDto[]>(apps, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps`)
        .expect(200)
        .expect(apps);
    });

    it('success - should return status 500', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<AppDto[]>(null, 401, 'Refuse');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps`)
        .expect(500, expected);
    });

    it('success - should return status 404', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = {
        statusCode: 404,
        error: 'Not Found',
        details: [
          {
            messages: [ `Customer with id "${customerId}" not found` ],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<AppDto[]>(null, 404, 'Not Found');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps`)
        .expect(404, expected);
    });
  });

  describe('List All Integrations for a App - GET /customers/{customerId}/apps/{appName}/integrations', () => {
    it('success - should return status 200 with apps list filled', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrations: IntegrationDto[] = [
        {
          customerId,
          name: 'app.test.1',
          integrationId: 'f1f86af0-826c-43e8-b5f4-fd78406a85c5',
          domainsCount: 3,
        } as IntegrationDto,
        {
          customerId,
          name: 'app.test.2',
          integrationId: '9f77f510-3cff-4508-ad4b-42471ad84a04',
          domainsCount: 2,
        } as IntegrationDto,
      ];

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(integrations, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(200, integrations);
    });

    it('success - should return status 200 with contextual fields filled', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrations: IntegrationDto[] = [
        {
          customerId,
          name: 'app.test.1',
          integrationId: 'f1f86af0-826c-43e8-b5f4-fd78406a85c5',
          domainsCount: 3,
          fingerpringSimilarity: 20,
          newDeviceSimilarity: 80,
          fingerprintFreshness: 91,
          featureTolerance: 16,
        } as IntegrationDto,
      ];

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(integrations, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(200)
        .expect(integrations);
    });

    it('success - should return status 200 with 2fa fields filled', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrations: IntegrationDto[] = [
        {
          customerId,
          name: 'app.test.1',
          integrationId: 'f1f86af0-826c-43e8-b5f4-fd78406a85c5',
          domainsCount: 3,
          featureTolerance: 4,
          expiriationTime: 40,
          maxAuthAttempts: 5,
          codeExpirationTime: 60,
          maxCodeSubmission: 10,
          codeSubmissionInterval: 11,
          capabilities: ['SMS', 'OPT'],
          reuseCode: true,
          checkCodeInUtc: false,
          expirationTimeRange: 15,
          whitelistActive: true,
          whilelistIps: ['127.0.0.2', '127.0.0.3'],
          contextualActive: true,
          contextualEndpoint: 'valididomain.com.br',
          contextualUser: 'user1',
          contextualPassword: 'semha',
        } as IntegrationDto,
      ];

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(integrations, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(200)
        .expect(integrations);
    });

    it('success - should return status 200 with empty list', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrations: IntegrationDto[] = [];

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(integrations, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(200)
        .expect(integrations);
    });

    it('success - should return status 400 when IP list is wrong', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrations: IntegrationDto[] = [
        {
          customerId,
          name: 'app.test.1',
          integrationId: 'f1f86af0-826c-43e8-b5f4-fd78406a85c5',
          domainsCount: 3,
          whilelistIps: ['xpto', 'xpto'],
        } as IntegrationDto,
      ];

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(integrations, 200, 'OK'); // will no call this method!
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(400);
    });

    it('success - should return status 400 when IP list is wrong', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrations: IntegrationDto[] = [];

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(integrations, 200, 'OK'); // will no call this method!
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(400);
    });

    it('success - should return status 500', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const expected: any = { statusCode: 500, error: 'Internal Server Error'};

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(null, 401, 'Refuse');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(500, expected);
    });

    it('success - should return status 404', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const expected: any = {
        statusCode: 404,
        error: 'Not Found',
        details: [
          {
            messages: [ `Customer with id "${customerId}" and app name "${appName}" not found` ],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<IntegrationDto[]>(null, 404, 'NotFound');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations`)
        .expect(404, expected);
    });
  });

  describe('List All Domains for a Apps - GET /customers/{customerId}/apps/{appName}/integrations', () => {
    it('success - should return status 200 with apps list filled', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrationId = 'f1f86af0-826c-43e8-b5f4-fd78406a85c5';

      const domains: DomainDto[] = [
        {
          customerId,
          appName: 'app.test.1',
          integrationId: 'f1f86af0-826c-43e8-b5f4-fd78406a85c5',
          domain: 'test1.com.br',
        },
        {
          customerId,
          appName: 'app.test.2',
          integrationId: '9f77f510-3cff-4508-ad4b-42471ad84a04',
          domain: 'test2.com.br',
        },
      ];

      const mockResponse = createMockHttpResponse<DomainDto[]>(domains, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations/${integrationId}/domains`)
        .expect(200)
        .expect(domains);
    });
    it('success - should return status 200 with empty list', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrationId = 'f1f86af0-826c-43e8-b5f4-fd78406a85c5';

      const domains: DomainDto[] = [];

      const mockResponse = createMockHttpResponse<DomainDto[]>(domains, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations/${integrationId}/domains`)
        .expect(200)
        .expect(domains);
    });

    it('success - should return status 500', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrationId = 'f1f86af0-826c-43e8-b5f4-fd78406a85c5';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<DomainDto[]>(null, 401, 'Refuse');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations/${integrationId}/domains`)
        .expect(500, expected);
    });

    it('success - should return status 404', () => {
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const appName = 'app.test.1';
      const integrationId = 'f1f86af0-826c-43e8-b5f4-fd78406a85c5';
      const expected: any = {
        statusCode: 404,
        error: 'Not Found',
        details: [
          {
            messages: [ `Customer with id "${customerId}", app name "${appName}" and integration "${integrationId}" not found` ],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<DomainDto[]>(null, 404, 'NotFound');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      return request(server)
        .get(`/api/v1/customers/${customerId}/apps/${appName}/integrations/${integrationId}/domains`)
        .expect(404, expected);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
