import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { AllExceptionsFilter } from '../../src/shared/all-exceptions.filter';
import { CustomHttpService } from '../../src/shared/custom.http/services/custom.http.service';
import { createMockHttpResponse } from '../../src/shared/custom.http/helpers/helper.functions';
import { CustomerSummaryDto, CustomerDetailsDto, CreateCustomerDto, UpdateCustomerDto } from '../../src/customers/dtos';

describe('CustomersController (e2e)', () => {
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

  describe('List All Customers - GET /api/v1/customers', () => {
    it('success - should return status 200 with customers list filled', () => {
      // Arrange
      const expected: CustomerSummaryDto[] = [
        {
          id: '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0',
          name: 'Customer 01',
          active: true,
          hasContextualAccess: false,
          hasAllowme2faAccess: true,
          hasTrustedOnBoardAccess: false,
        },
        {
          id: '9ba879e5-6f5f-4612-82cd-3148fde5b41e',
          name: 'Customer 02',
          active: false,
          hasContextualAccess: true,
          hasAllowme2faAccess: true,
          hasTrustedOnBoardAccess: false,
        },
      ];
      const mockResponse = createMockHttpResponse<CustomerSummaryDto[]>(expected, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get('/api/v1/customers')
        .expect(200, expected);
    });

    it('success - should return status 200 with empty customers list', () => {
      // Arrange
      const expected: CustomerSummaryDto[] = [];

      const mockResponse = createMockHttpResponse<CustomerSummaryDto[]>(expected, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get('/api/v1/customers')
        .expect(200, expected);
    });

    it('error - should return 401 when unauthorized', async () => {
      // Setup App and Server with Auth
      await app.close();
      app = await createApp({mockAuth: false});
      server = app.getHttpServer();
      await app.init();

      // Arrange
      const expected: any = { statusCode: 401, error: 'Unauthorized' };

      const mockResponse = createMockHttpResponse<CustomerSummaryDto[]>(null, 401, 'Unauthorized');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get('/api/v1/customers')
        .expect(401, expected);
    });

    it('error - should return status 500 when external service return error (Test case 500 - InternalServerError)', () => {
      // Arrange
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<CustomerSummaryDto[]>(null, 500, 'InternalServerError');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get('/api/v1/customers')
        .expect(500, expected);
    });

    it('error - should return status 500 when external service return error (Test case 503 - ServiceUnavailable)', () => {
      // Arrange
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<CustomerSummaryDto[]>(null, 503, 'ServiceUnavailable');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get('/api/v1/customers')
        .expect(500, expected);
    });
  });

  describe('Get Specific Customer - GET /api/v1/customers/53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0', () => {
    it('success - should return status 200 with customer details filled', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const expected: CustomerDetailsDto = {
        id: customerId,
        name: 'Customer 01',
        active: true,
        codename: 'cust_01',
        hasContextualAccess: false,
        hasAllowme2faAccess: false,
        hasTrustedOnBoardAccess: true,
        fingerprintFreshness: 60,
        contextualStreamNameTransactionCreated: 'allowme-created-transactions-customer01-stream',
        contextualStreamNameTransactionUpdated: 'allowme-updated-transactions-customer01-stream',
        allowme2faSubdomain: 'customer01.sentinelapp.com.br',
        allowme2faCustomerId: 10,
        allowme2faIgnoreGatewaysId: '',
        secret: 'sags warp ones arum rusk odds',
      };
      const mockResponse = createMockHttpResponse<CustomerDetailsDto>(expected, 200, 'OK');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get(`/api/v1/customers/${customerId}`)
        .expect(200, expected);
    });

    it('error - should return 400 when customerId is invalid (abc)', () => {
      // Arrange
      const customerId: string = 'abc';
      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            messages: [
              'Validation failed (uuid vundefined is expected)',
            ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .get(`/api/v1/customers/${customerId}`)
        .expect(400, expected);
    });

    it('error - should return 404 when customerId not exists', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const expected: any = {
        statusCode: 404,
        error: 'Not Found',
        details: [
          {
            messages: [
              `Customer with id "${customerId}" not found`,
            ],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<CustomerDetailsDto>(null, 404, 'NotFound');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get(`/api/v1/customers/${customerId}`)
        .expect(404, expected);
    });

    it('error - should return 401 when unauthorized', async () => {
      // Setup App and Server with Auth
      await app.close();
      app = await createApp({mockAuth: false});
      server = app.getHttpServer();
      await app.init();

      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 401, error: 'Unauthorized' };

      const mockResponse = createMockHttpResponse<CustomerDetailsDto>(null, 401, 'Unauthorized');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get(`/api/v1/customers/${customerId}`)
        .expect(401, expected);
    });

    it('error - should return status 500 when external service return error (Test case 500 - InternalServerError)', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<CustomerDetailsDto>(null, 500, 'InternalServerError');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get(`/api/v1/customers/${customerId}`)
        .expect(500, expected);
    });

    it('error - should return status 500 when external service return error (Test case 503 - ServiceUnavailable)', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<CustomerDetailsDto>(null, 503, 'ServiceUnavailable');
      jest.spyOn(customHttpService, 'get').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .get(`/api/v1/customers/${customerId}`)
        .expect(500, expected);
    });
  });

  describe('Create Customer - POST /api/v1/customers', () => {

    const  validRequestPayload: CreateCustomerDto = {
      name: 'Customer 01',
      hasContextualAccess: false,
      hasAllowme2faAccess: false,
      hasTrustedOnBoardAccess: false,
      fingerprintFreshness: null,
      allowme2faSubdomain: '',
      codename: '',
    };

    it('success - should return status 201 when customer was created', () => {
      // Arrange
      const mockResponse = createMockHttpResponse<any>(null, 201, 'Created');
      jest.spyOn(customHttpService, 'post').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(validRequestPayload)
        .expect(201);
    });

    it('error - should return 400 and errors when empty payload is informed', () => {
      // Arrange
      const emptyRequestPayload = {} as CreateCustomerDto;

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'name',
            messages: [ 'name should not be empty' ],
          },
          {
            field: 'hasContextualAccess',
            messages: [ 'hasContextualAccess must be a boolean value' ],
          },
          {
            field: 'hasAllowme2faAccess',
            messages: [ 'hasAllowme2faAccess must be a boolean value' ],
          },
          {
            field: 'hasTrustedOnBoardAccess',
            messages: [ 'hasTrustedOnBoardAccess must be a boolean value' ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(emptyRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 400 and errors when required fields of contextual not informed', () => {
      // Arrange
      const invalidRequestPayload: CreateCustomerDto = {
        ...validRequestPayload,
        hasContextualAccess: true,
        fingerprintFreshness: null,
      };

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'fingerprintFreshness',
            messages: [
              'fingerprintFreshness must be a positive number',
              'fingerprintFreshness must be a number',
            ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(invalidRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 400 and errors when required fields of allowme2fa not informed', () => {
      // Arrange
      const invalidRequestPayload: CreateCustomerDto = {
        ...validRequestPayload,
        hasAllowme2faAccess: true,
        allowme2faSubdomain: '',
      };

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'allowme2faSubdomain',
            messages: [ 'allowme2faSubdomain should not be empty' ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(invalidRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 400 and errors when required fields of trusted not informed', () => {
      // Arrange
      const invalidRequestPayload: CreateCustomerDto = {
        ...validRequestPayload,
        hasTrustedOnBoardAccess: true,
        codename: '',
      };

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'codename',
            messages: [ 'codename should not be empty' ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(invalidRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 401 when unauthorized', async () => {
      // Setup App and Server with Auth
      await app.close();
      app = await createApp({mockAuth: false});
      server = app.getHttpServer();
      await app.init();

      // Arrange
      const expected: any = { statusCode: 401, error: 'Unauthorized' };

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(validRequestPayload)
        .expect(401, expected);
    });

    it('error - should return 409 when already exists', () => {
      // Arrange
      const expected: any = {
        statusCode: 409,
        error: 'Conflict',
        details: [
          {
            messages: ['Customer already exists'],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<any>(null, 409, 'Conflict');
      jest.spyOn(customHttpService, 'post').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(validRequestPayload)
        .expect(409, expected);
    });

    it('error - should return status 500 when external service return error (Test case 500 - InternalServerError)', () => {
      // Arrange
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<any>(null, 500, 'InternalServerError');
      jest.spyOn(customHttpService, 'post').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(validRequestPayload)
        .expect(500, expected);
    });

    it('error - should return status 500 when external service return error (Test case 503 - ServiceUnavailable)', () => {
      // Arrange
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<any>(null, 503, 'ServiceUnavailable');
      jest.spyOn(customHttpService, 'post').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .post('/api/v1/customers')
        .send(validRequestPayload)
        .expect(500, expected);
    });
  });

  describe('Update Customer - PUT /api/v1/customers/53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0', () => {

    const validRequestPayload: UpdateCustomerDto = {
      name: 'Customer 01',
      active: false,
      hasContextualAccess: false,
      hasAllowme2faAccess: false,
      hasTrustedOnBoardAccess: false,
      fingerprintFreshness: 60,
      allowme2faSubdomain: '',
      allowme2faCustomerId: 0,
      allowme2faIgnoreGatewaysId: '',
      codename: '',
    };

    it('success - should return status 200 with customer was updated', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const mockResponse = createMockHttpResponse<any>(null, 200, 'OK');
      jest.spyOn(customHttpService, 'put').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(validRequestPayload)
        .expect(200);
    });

    it('error - should return 401 when unauthorized', async () => {
      // Setup App and Server with Auth
      await app.close();
      app = await createApp({mockAuth: false});
      server = app.getHttpServer();
      await app.init();

      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 401, error: 'Unauthorized' };

      const mockResponse = createMockHttpResponse<any>(null, 401, 'Unauthorized');
      jest.spyOn(customHttpService, 'put').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(validRequestPayload)
        .expect(401, expected);
    });

    it('error - should return 400 when customerId is invalid (abc)', () => {
      // Arrange
      const customerId: string = 'abc';

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .expect(400);
    });

    it('error - should return 400 and errors when empty payload is informed', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const emptyRequestPayload = {} as UpdateCustomerDto;

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'name',
            messages: [ 'name should not be empty' ],
          },
          {
            field: 'active',
            messages: [ 'active must be a boolean value' ],
          },
          {
            field: 'hasContextualAccess',
            messages: [ 'hasContextualAccess must be a boolean value' ],
          },
          {
            field: 'hasAllowme2faAccess',
            messages: [ 'hasAllowme2faAccess must be a boolean value' ],
          },
          {
            field: 'hasTrustedOnBoardAccess',
            messages: [ 'hasTrustedOnBoardAccess must be a boolean value' ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(emptyRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 400 and errors when required fields of contextual not informed', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const invalidRequestPayload: UpdateCustomerDto = {
        ...validRequestPayload,
        hasContextualAccess: true,
        fingerprintFreshness: null,
      };

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'fingerprintFreshness',
            messages: [
              'fingerprintFreshness must be a positive number',
              'fingerprintFreshness must be a number',
            ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(invalidRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 400 and errors when required fields of allowme2fa not informed', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const invalidRequestPayload: UpdateCustomerDto = {
        ...validRequestPayload,
        hasAllowme2faAccess: true,
        allowme2faSubdomain: '',
        allowme2faCustomerId: null,
        allowme2faIgnoreGatewaysId: '',
      };

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'allowme2faSubdomain',
            messages: [ 'allowme2faSubdomain should not be empty' ],
          },
          {
            field: 'allowme2faCustomerId',
            messages: [
              'allowme2faCustomerId must be a positive number',
              'allowme2faCustomerId must be a number',
            ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(invalidRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 400 and errors when required fields of trusted not informed', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const invalidRequestPayload: UpdateCustomerDto = {
        ...validRequestPayload,
        hasTrustedOnBoardAccess: true,
        codename: '',
      };

      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            field: 'codename',
            messages: [ 'codename should not be empty' ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(invalidRequestPayload)
        .expect(400, expected);
    });

    it('error - should return 404 when customerId not exists', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = {
        statusCode: 404,
        error: 'Not Found',
        details: [
          {
            messages: [ `Customer with id "${customerId}" not found` ],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<any>(null, 404, 'NotFound');
      jest.spyOn(customHttpService, 'put').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(validRequestPayload)
        .expect(404, expected);
    });

    it('error - should return status 500 when external service return error (Test case 500 - InternalServerError)', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<any>(null, 500, 'InternalServerError');
      jest.spyOn(customHttpService, 'put').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(validRequestPayload)
        .expect(500, expected);
    });

    it('error - should return status 500 when external service return error (Test case 503 - ServiceUnavailable)', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<any>(null, 503, 'ServiceUnavailable');
      jest.spyOn(customHttpService, 'put').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .put(`/api/v1/customers/${customerId}`)
        .send(validRequestPayload)
        .expect(500, expected);
    });
  });

  describe('Delete Customer - DELETE /api/v1/customers/53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0', () => {
    it('success - should return status 200 with customer was deleted', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const mockResponse = createMockHttpResponse<any>(null, 200, 'OK');
      jest.spyOn(customHttpService, 'delete').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .delete(`/api/v1/customers/${customerId}`)
        .expect(200);
    });

    it('error - should return 400 when customerId is invalid (abc)', () => {
      // Arrange
      const customerId: string = 'abc';
      const expected: any = {
        statusCode: 400,
        error: 'Bad Request',
        details: [
          {
            messages: [ 'Validation failed (uuid vundefined is expected)' ],
          },
        ],
      };

      // Act / Asserts
      return request(server)
        .delete(`/api/v1/customers/${customerId}`)
        .expect(400, expected);
    });

    it('error - should return 404 when customerId not exists', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = {
        statusCode: 404,
        error: 'Not Found',
        details: [
          {
            messages: [ `Customer with id "${customerId}" not found` ],
          },
        ],
      };

      const mockResponse = createMockHttpResponse<any>(null, 404, 'Not Found');
      jest.spyOn(customHttpService, 'delete').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .delete(`/api/v1/customers/${customerId}`)
        .expect(404, expected);
    });

    it('error - should return 401 when unauthorized', async () => {
      // Setup App and Server with Auth
      await app.close();
      app = await createApp({mockAuth: false});
      server = app.getHttpServer();
      await app.init();

      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 401, error: 'Unauthorized' };

      const mockResponse = createMockHttpResponse<any>(null, 401, 'Unauthorized');
      jest.spyOn(customHttpService, 'delete').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .delete(`/api/v1/customers/${customerId}`)
        .expect(401, expected);
    });

    it('error - should return status 500 when external service return error (Test case 500 - InternalServerError)', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<any>(null, 500, 'InternalServerError');
      jest.spyOn(customHttpService, 'delete').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .delete(`/api/v1/customers/${customerId}`)
        .expect(500, expected);
    });

    it('error - should return status 500 when external service return error (Test case 503 - ServiceUnavailable)', () => {
      // Arrange
      const customerId: string = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const expected: any = { statusCode: 500, error: 'Internal Server Error' };

      const mockResponse = createMockHttpResponse<any>(null, 503, 'ServiceUnavailable');
      jest.spyOn(customHttpService, 'delete').mockResolvedValue(mockResponse);

      // Act / Asserts
      return request(server)
        .delete(`/api/v1/customers/${customerId}`)
        .expect(500, expected);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
