import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../shared/config/services/config.service';
import { CustomHttpService } from '../../shared/custom.http/services/custom.http.service';
import { CustomerSummaryDto, CustomerDetailsDto, CreateCustomerDto, UpdateCustomerDto } from '../dtos';
import {
  throwNotFoundExceptionIfStatusIs404,
  throwConflictExceptionIfStatusIs409,
  throwInternalServerErrorIfNotSuccess,
} from '../../shared/custom.http/helpers/helper.functions';

@Injectable()
export class CustomerService {
  constructor(
    private http: CustomHttpService,
    private configService: ConfigService,
  ) {
    this.http.baseUrl = this.configService.credentialBaseUrl;
  }

  async getAll(): Promise<CustomerSummaryDto[]> {
    const response = await this.http.get<CustomerSummaryDto[]>('/customers');

    throwInternalServerErrorIfNotSuccess(response);

    return response.data;
  }

  async getById(id: string): Promise<CustomerDetailsDto> {
    const response = await this.http.get<CustomerDetailsDto>(`/customers/${id}`);

    throwNotFoundExceptionIfStatusIs404(response, `Customer with id "${id}" not found`);
    throwInternalServerErrorIfNotSuccess(response);

    return response.data;
  }

  async create(createCustomer: CreateCustomerDto): Promise<void> {
    const response = await this.http.post<any>(`/customers`, createCustomer);

    throwConflictExceptionIfStatusIs409(response, 'Customer already exists');
    throwInternalServerErrorIfNotSuccess(response);
  }

  async update(id: string, updateCustomer: UpdateCustomerDto): Promise<void> {
    const response = await this.http.put<any>(`/customers/${id}`, updateCustomer);

    throwNotFoundExceptionIfStatusIs404(response, `Customer with id "${id}" not found`);
    throwConflictExceptionIfStatusIs409(response, 'Customer already exists');
    throwInternalServerErrorIfNotSuccess(response);
  }

  async disable(id: string): Promise<void> {
    const response = await this.http.delete<any>(`/customers/${id}`);

    throwNotFoundExceptionIfStatusIs404(response, `Customer with id "${id}" not found`);
    throwInternalServerErrorIfNotSuccess(response);
  }
}
