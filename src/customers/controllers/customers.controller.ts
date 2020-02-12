import { Controller, Body, Param, Get, Post, Put, Delete, ParseUUIDPipe, UseGuards, HttpCode } from '@nestjs/common';
import {
  ApiUseTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse,
  ApiUnauthorizedResponse, ApiNotFoundResponse, ApiConflictResponse, ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CustomerService } from '../services/customer.service';
import { CustomerSummaryDto, CustomerDetailsDto, CreateCustomerDto, UpdateCustomerDto } from '../dtos';

@ApiUseTags('customers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@Controller('/api/v1/customers')
export class CustomersController {
  constructor(
    private customerService: CustomerService,
  ) {}

  @Get()
  @ApiOperation({ title: 'List all customers', description: 'List all customers' })
  @ApiOkResponse({ description: 'Returns a list with all customers successfully' })
  getAll(): Promise<CustomerSummaryDto[]> {
    return this.customerService.getAll();
  }

  @Get(':id')
  @ApiOperation({ title: 'Get customer details', description: 'Get customer by customerId' })
  @ApiOkResponse({ description: 'Returns the customer corresponding to the customer Id informed' })
  @ApiBadRequestResponse({description: 'Parameter Id is invalid UUID'})
  @ApiNotFoundResponse({description: 'Customer not found' })
  getById(@Param('id', ParseUUIDPipe) customerId: string): Promise<CustomerDetailsDto> {
    return this.customerService.getById(customerId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ title: 'Create customer', description: 'Create a new customer' })
  @ApiCreatedResponse({ description: 'The customer has been successfully created' })
  @ApiBadRequestResponse({ description: 'Request payload has validation errors' })
  @ApiConflictResponse({ description: 'Already exists a customer with informed values' })
  create(@Body() customerDto: CreateCustomerDto): Promise<void> {
    return this.customerService.create(customerDto);
  }

  @Put(':id')
  @ApiOperation({ title: 'Update customer', description: 'Update a existing customer' })
  @ApiOkResponse({ description: 'The customer has been successfully updated' })
  @ApiBadRequestResponse({ description: 'Parameter Id is invalid UUID or request payload has validation errors' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  @ApiConflictResponse({ description: 'Already exists a customer with informed values' })
  update(@Param('id', ParseUUIDPipe) customerId: string, @Body() customerDto: UpdateCustomerDto): Promise<void> {
    return this.customerService.update(customerId, customerDto);
  }

  @Delete(':id')
  @ApiOperation({ title: 'Delete customer', description: 'Delete a existing customer' })
  @ApiOkResponse({ description: 'The customer has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'Parameter Id is invalid UUID' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  disable(@Param('id', ParseUUIDPipe) customerId: string): Promise<void> {
    return this.customerService.disable(customerId);
  }
}
