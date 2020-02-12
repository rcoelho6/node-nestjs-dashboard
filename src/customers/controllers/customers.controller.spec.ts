import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomerService } from '../services/customer.service';
import { CustomerSummaryDto, CustomerDetailsDto, CreateCustomerDto, UpdateCustomerDto } from '../dtos';

const mockCustomersService = () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  disable: jest.fn(),
});

describe('CustomersController', () => {
  let controller: CustomersController;
  let customerService: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomerService,
          useFactory: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    customerService = module.get<CustomerService>(CustomerService);
  });

  it('CustomersController should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should get all customers successfuly', async () => {
      // Arrange
      const mockResponse: CustomerSummaryDto[] = [expect.any(CustomerSummaryDto), expect.any(CustomerSummaryDto)];
      jest.spyOn(customerService, 'getAll').mockResolvedValue(mockResponse);

      // Action
      const result = await controller.getAll();

      // Assert
      expect(customerService.getAll).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(mockResponse);
    });

    it('should thrown a internal server error exception', async () => {
      // Arrange
      jest.spyOn(customerService, 'getAll').mockRejectedValue(new InternalServerErrorException());

      // Act
      const action = () => controller.getAll();

      // Assert
      await expect(action()).rejects.toThrow(InternalServerErrorException);
      expect(customerService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should get a customer successfuly', async () => {
      // Arrange
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';

      const mockResponse: CustomerDetailsDto = expect.any(CustomerDetailsDto);
      jest.spyOn(customerService, 'getById').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getById(customerId);

      // Assert
      expect(customerService.getById).toHaveBeenCalledTimes(1);
      expect(customerService.getById).toHaveBeenCalledWith(customerId);
      expect(result).toStrictEqual(mockResponse);
    });

    it('should thrown a not found exception', async () => {
      // Arrange
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';

      jest.spyOn(customerService, 'getById').mockRejectedValue(new NotFoundException());

      // Act
      const action = () => controller.getById(customerId);

      // Assert
      await expect(action()).rejects.toThrow(NotFoundException);
      expect(customerService.getById).toHaveBeenCalledTimes(1);
      expect(customerService.getById).toHaveBeenCalledWith(customerId);
    });
  });

  describe('create', () => {
    it('should create a customer successfuly', async () => {
      // Arrange
      const createCustomer: CreateCustomerDto = expect.any(CreateCustomerDto);

      jest.spyOn(customerService, 'create').mockResolvedValue();

      // Act
      await controller.create(createCustomer);

      // Assert
      expect(customerService.create).toHaveBeenCalledTimes(1);
      expect(customerService.create).toHaveBeenCalledWith(createCustomer);
    });

    it('should thrown a bad request when payload is invalid', async () => {
      // Arrange
      const createCustomer: CreateCustomerDto = expect.any(CreateCustomerDto);

      jest.spyOn(customerService, 'create').mockRejectedValue(new BadRequestException());

      // Act
      const action = () => controller.create(createCustomer);

      // Assert
      await expect(action()).rejects.toThrow(BadRequestException);
      expect(customerService.create).toHaveBeenCalledTimes(1);
      expect(customerService.create).toHaveBeenCalledWith(createCustomer);
    });
  });

  describe('update', () => {
    it ('shoud execute update with success', async () => {
      // Arrange
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const updateCustomer: UpdateCustomerDto = expect.any(UpdateCustomerDto);

      jest.spyOn(customerService, 'update').mockResolvedValue();

      // Act
      await controller.update(customerId, updateCustomer);

      // Assert
      expect(customerService.update).toHaveBeenCalledTimes(1);
      expect(customerService.update).toHaveBeenCalledWith(customerId, updateCustomer);
    });

    it ('should thrown a not found exception when id not exists', async () => {
      // Arrange
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';
      const updateCustomer: UpdateCustomerDto = expect.any(UpdateCustomerDto);

      jest.spyOn(customerService, 'update').mockRejectedValue(new NotFoundException());

      // Act
      const action = () => controller.update(customerId, updateCustomer);

      // Assert
      await expect(action()).rejects.toThrow(NotFoundException);
      expect(customerService.update).toHaveBeenCalledTimes(1);
      expect(customerService.update).toHaveBeenCalledWith(customerId, updateCustomer);
    });
  });

  describe('disable', () => {
    it ('shoud execute disable with success', async () => {
      // Arrange
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';

      jest.spyOn(customerService, 'disable').mockResolvedValue();

      // Act
      await controller.disable(customerId);

      // Assert
      expect(customerService.disable).toHaveBeenCalledTimes(1);
      expect(customerService.disable).toHaveBeenCalledWith(customerId);
    });

    it ('should thrown a not found exception when customerId not exists', async () => {
      // Arrange
      const customerId = 'aedb0d94-389b-464a-8a4f-df92f07fb61d';

      jest.spyOn(customerService, 'disable').mockRejectedValue(new NotFoundException());

      // Act
      const action = () => controller.disable(customerId);

      // Assert
      await expect(action()).rejects.toThrow(NotFoundException);
      expect(customerService.disable).toHaveBeenCalledTimes(1);
      expect(customerService.disable).toHaveBeenCalledWith(customerId);
    });
  });
});
