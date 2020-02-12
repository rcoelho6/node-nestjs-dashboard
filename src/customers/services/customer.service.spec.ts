import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../shared/config/services/config.service';
import { CustomerService } from './customer.service';
import { CustomerSummaryDto, CustomerDetailsDto, CreateCustomerDto, UpdateCustomerDto } from '../dtos';
import { CustomHttpService } from '../../shared/custom.http/services/custom.http.service';
import { createMockHttpResponse } from '../../shared/custom.http/helpers/helper.functions';
import { InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';

function createMockConfigService() {
  const mockObject = {
    credentialBaseUrl: '',
  };
  Object.defineProperty(mockObject, 'credentialBaseUrl', {
    get: jest.fn(),
  });
  return mockObject;
}

function createMockCustomHttpService() {
  const mockObject = {
    baseUrl: '',
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  Object.defineProperty(mockObject, 'baseUrl', {
    get: jest.fn(),
    set: jest.fn(),
  });
  return mockObject;
}

describe('CustomerService', () => {
  let service: CustomerService;

  let configService: ConfigService;
  let spyConfigServiceCredentialBaseUrl: jest.SpyInstance<string, []>;

  let httpService: CustomHttpService;
  let spyHttpServiceSetBaseUrl: jest.SpyInstance<void, [string]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: ConfigService,
          useFactory: createMockConfigService,
        },
        {
          provide: CustomHttpService,
          useFactory: createMockCustomHttpService,
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    spyConfigServiceCredentialBaseUrl = jest.spyOn(configService, 'credentialBaseUrl', 'get');
    spyConfigServiceCredentialBaseUrl.mockReturnValue('http://localhost:3000');

    httpService = module.get<CustomHttpService>(CustomHttpService);
    spyHttpServiceSetBaseUrl = jest.spyOn(httpService, 'baseUrl', 'set');
    spyHttpServiceSetBaseUrl.mockImplementation(url => {
      httpService.baseUrl = url;
    });

    service = module.get<CustomerService>(CustomerService);
  });

  it('CustomerService should be defined', () => {
    expect(service).toBeDefined();
    expect(spyConfigServiceCredentialBaseUrl).toHaveBeenCalled();
    expect(configService.credentialBaseUrl).toBe('http://localhost:3000');

    expect(spyHttpServiceSetBaseUrl).toHaveBeenCalled();
    // expect(spyHttpServiceSetBaseUrl).toHaveBeenCalledWith('http://localhost:3000');
    // expect(httpService.baseUrl).toBe('http://localhost:3000');
  });

  describe('Get All Customers', () => {
    it('should return a list of customers with success (200 - OK)', async () => {
      // Arrange
      const customers: CustomerSummaryDto[] = [expect.any(CustomerSummaryDto), expect.any(CustomerSummaryDto)];
      const httpResponse = createMockHttpResponse<CustomerSummaryDto[]>(customers, 200, 'OK');
      jest.spyOn(httpService, 'get').mockResolvedValue(httpResponse);

      // Act
      const response = await service.getAll();

      // Assert
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith('/customers');
      expect(response).toStrictEqual(customers);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (401 - Unauthorized)', async () => {
      // Arrange
      const httpResponse = createMockHttpResponse<CustomerSummaryDto[]>(null, 401, 'Unauthorized');
      jest.spyOn(httpService, 'get').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.getAll();

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith('/customers');
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (503 - ServiceUnavailable)', async () => {
      // Arrange
      const httpResponse = createMockHttpResponse<CustomerSummaryDto[]>(null, 503, 'ServiceUnavailable');
      jest.spyOn(httpService, 'get').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.getAll();

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith('/customers');
    });
  });

  describe('Get Customer By Id', () => {
    it('should get a specific customer with success (200 - OK)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const customerDetails: CustomerDetailsDto = expect.any(CustomerDetailsDto);
      const mockResponse = createMockHttpResponse<CustomerDetailsDto>(customerDetails, 200, 'OK');
      jest.spyOn(httpService, 'get').mockResolvedValue(mockResponse);

      // Act
      const response = await service.getById(customerId);

      // Assert
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(`/customers/${customerId}`);
      expect(response).toStrictEqual(customerDetails);
    });

    it('should thrown a NotFoundException when external service returns not found status code (404 - NotFound)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const httpResponse = createMockHttpResponse<CustomerDetailsDto>(null, 404, 'NotFound');
      jest.spyOn(httpService, 'get').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.getById(customerId);

      // Assert
      await expect(action()).rejects.toThrow(NotFoundException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(`/customers/${customerId}`);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (401 - Unauthorized)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const httpResponse = createMockHttpResponse<CustomerDetailsDto>(null, 401, 'Unauthorized');
      jest.spyOn(httpService, 'get').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.getById(customerId);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(`/customers/${customerId}`);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (503 - ServiceUnavailable)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const httpResponse = createMockHttpResponse<CustomerDetailsDto>(null, 503, 'ServiceUnavailable');
      jest.spyOn(httpService, 'get').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.getById(customerId);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(`/customers/${customerId}`);
    });
  });

  describe('Create Customer', () => {
    it('should create a Customer with success', async () => {
      // Arrange
      const createCustomer: CreateCustomerDto = expect.any(CreateCustomerDto);

      const mockResponse = createMockHttpResponse<any>(null, 201, 'Created');
      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse);

      // Act
      await service.create(createCustomer);

      // Assert
      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith('/customers', createCustomer);
    });

    it('should thrown a ConflictException when external service returns not success status code (409 - Conflict)', async () => {
      // Arrange
      const createCustomer: CreateCustomerDto = expect.any(CreateCustomerDto);

      const mockResponse = createMockHttpResponse<any>(null, 409, 'Conflict');
      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse);

      // Act
      const action = () =>  service.create(createCustomer);

      // Assert
      await expect(action()).rejects.toThrow(ConflictException);
      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith('/customers', createCustomer);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (401 - Unauthorized)', async () => {
      // Arrange
      const createCustomer: CreateCustomerDto = expect.any(CreateCustomerDto);

      const mockResponse = createMockHttpResponse<any>(null, 401, 'Unauthorized');
      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse);

      // Act
      const action = () =>  service.create(createCustomer);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith('/customers', createCustomer);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (503 - ServiceUnavailable)', async () => {
      // Arrange
      const createCustomer: CreateCustomerDto = expect.any(CreateCustomerDto);

      const mockResponse = createMockHttpResponse<any>(null, 503, 'ServiceUnavailable');
      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse);

      // Act
      const action = () =>  service.create(createCustomer);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith('/customers', createCustomer);
    });
  });

  describe('Update Customer', () => {
    it('should update a Customer with success', async () => {
      // Arrange
      const customerId = '50e18703-208e-45da-8491-ccd4e424f8b8';
      const updateCustomer: UpdateCustomerDto = expect.any(UpdateCustomerDto);

      const mockResponse = createMockHttpResponse<any>(null, 200, 'OK');
      jest.spyOn(httpService, 'put').mockResolvedValue(mockResponse);

      // Act
      await service.update(customerId, updateCustomer);

      // Assert
      expect(httpService.put).toHaveBeenCalledTimes(1);
      expect(httpService.put).toHaveBeenCalledWith(`/customers/${customerId}`, updateCustomer);
    });

    it('should thrown a NotFoundException when external service returns not found status code (404 - NotFound)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const updateCustomer: UpdateCustomerDto = expect.any(UpdateCustomerDto);

      const httpResponse = createMockHttpResponse<any>(null, 404, 'NotFound');
      jest.spyOn(httpService, 'put').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.update(customerId, updateCustomer);

      // Assert
      await expect(action()).rejects.toThrow(NotFoundException);
      expect(httpService.put).toHaveBeenCalledTimes(1);
      expect(httpService.put).toHaveBeenCalledWith(`/customers/${customerId}`, updateCustomer);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (401 - Unauthorized)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const updateCustomer: UpdateCustomerDto = expect.any(UpdateCustomerDto);

      const httpResponse = createMockHttpResponse<any>(null, 401, 'Unauthorized');
      jest.spyOn(httpService, 'put').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.update(customerId, updateCustomer);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.put).toHaveBeenCalledTimes(1);
      expect(httpService.put).toHaveBeenCalledWith(`/customers/${customerId}`, updateCustomer);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (503 - ServiceUnavailable)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';
      const updateCustomer: UpdateCustomerDto = expect.any(UpdateCustomerDto);

      const httpResponse = createMockHttpResponse<any>(null, 503, 'ServiceUnavailable');
      jest.spyOn(httpService, 'put').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.update(customerId, updateCustomer);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.put).toHaveBeenCalledTimes(1);
      expect(httpService.put).toHaveBeenCalledWith(`/customers/${customerId}`, updateCustomer);
    });
  });

  describe('Disable Customer', () => {
    it('should disable a Customer with success', async () => {
      // Arrange
      const customerId = '50e18703-208e-45da-8491-ccd4e424f8b8';

      const mockResponse = createMockHttpResponse<any>(null, 200, 'OK');
      jest.spyOn(httpService, 'delete').mockResolvedValue(mockResponse);

      // Act
      await service.disable(customerId);

      // Assert
      expect(httpService.delete).toHaveBeenCalledTimes(1);
      expect(httpService.delete).toHaveBeenCalledWith(`/customers/${customerId}`);
    });

    it('should thrown a NotFoundException when external service returns not found status code (404 - NotFound)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const httpResponse = createMockHttpResponse<boolean>(false, 404, 'NotFound');
      jest.spyOn(httpService, 'delete').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.disable(customerId);

      // Assert
      await expect(action()).rejects.toThrow(NotFoundException);
      expect(httpService.delete).toHaveBeenCalledTimes(1);
      expect(httpService.delete).toHaveBeenCalledWith(`/customers/${customerId}`);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (401 - Unauthorized)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const httpResponse = createMockHttpResponse<any>(null, 401, 'Unauthorized');
      jest.spyOn(httpService, 'delete').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.disable(customerId);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.delete).toHaveBeenCalledTimes(1);
      expect(httpService.delete).toHaveBeenCalledWith(`/customers/${customerId}`);
    });

    it('should thrown a InternalServerErrorException when external service returns not success status code (503 - ServiceUnavailable)', async () => {
      // Arrange
      const customerId = '53bf20b9-8142-4b0a-b4b7-4cc4eecca0b0';

      const httpResponse = createMockHttpResponse<any>(null, 503, 'ServiceUnavailable');
      jest.spyOn(httpService, 'delete').mockResolvedValue(httpResponse);

      // Act
      const action = () =>  service.disable(customerId);

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(httpService.delete).toHaveBeenCalledTimes(1);
      expect(httpService.delete).toHaveBeenCalledWith(`/customers/${customerId}`);
    });
  });
});
