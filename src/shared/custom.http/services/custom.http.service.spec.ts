import { Test, TestingModule } from '@nestjs/testing';
import { AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/common';
import { of } from 'rxjs';
import { CustomHttpService } from './custom.http.service';
import { createMockHttpResponse } from '../helpers/helper.functions';

class PayloadDto {
  id?: number;
  age: number;
  name: string;
  birthDate: Date;
  children: any[];
}

const mockHttpService = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  axiosRef: {
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  },
});

describe('CustomHttpService', () => {
  const defaultRequestUrl = 'http://localhost:3000';
  const defaultRequestConfig: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  let service: CustomHttpService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomHttpService,
        {
          provide: HttpService,
          useFactory: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CustomHttpService>(CustomHttpService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('CustomHttpService should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CustomHttpService baseUrl', () => {
    it('should return empty string if baseUrl not was seted', () => {
      expect(service.baseUrl).toEqual('');
    });

    it('should set an url with success', () => {
      service.baseUrl = defaultRequestUrl;
      expect(service.baseUrl).toEqual(defaultRequestUrl);
    });

    it('should remove last slash from url if exists with success', () => {
      service.baseUrl = 'http://localhost:3000///';
      expect(service.baseUrl).toEqual('http://localhost:3000');

      service.baseUrl = 'http://localhost:3000/api//';
      expect(service.baseUrl).toEqual('http://localhost:3000/api');
    });
  });

  describe('CustomHttpService request with defaults and baseUrl', () => {
    it('should execute the request with default json headers if none was informed', async () => {
      // Arrange
      const url = 'http://localhost:3000/api';

      const responsePayload: any[] = [];

      const expected = createMockHttpResponse<any>(responsePayload, 200, 'OK');
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(expected));

      // Act
      await service.get<any>(url);

      // Assert
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(url, { headers: defaultRequestConfig.headers });
    });

    it('should execute the request with custom json headers if informed', async () => {
      // Arrange
      const url = 'http://localhost:3000/api';
      const customRequestConfig: AxiosRequestConfig = {
        method: 'GET',
        url: 'http://example.com/api/todos?page=1&limit=10',
        headers: {
          'Content-Type': 'application/xml',
          'Accept': 'application/xml',
          'Accept-Encoding': 'deflate, gzip;q=1.0, *;q=0.5',
        },
        auth: {
          username: 'username',
          password: 'password',
        },
      };

      const responsePayload: any[] = [];

      const expected = createMockHttpResponse<any>(responsePayload, 200, 'OK');
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(expected));

      // Act
      await service.get<any>(url, customRequestConfig);

      // Assert
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(url, customRequestConfig);
    });
  });

  describe('CustomHttpService GET', () => {
    it('should execute http get with success', async () => {
      // Arrange
      const id = 112;
      const url = `http://localhost:3000/api/persons/${id}`;

      const responsePayload: PayloadDto = {
        age: 35,
        name: 'Fulano',
        birthDate: new Date(1984, 5, 1, 0, 0, 0, 0),
        children: [
          { name: 'João', age: 10 },
          { name: 'Maria', age: 7 },
        ],
      };

      const expected = createMockHttpResponse<PayloadDto>(responsePayload, 200, 'OK');
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(expected));

      // Act
      const response = await service.get<PayloadDto>(url);

      // Assert
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(url, defaultRequestConfig);
      expect(response).toEqual(expected);
    });
  });

  describe('CustomHttpService POST', () => {
    it('should execute http post with success', async () => {
      // Arrange
      const url = 'http://localhost:3000/api/persons';

      const requestPayload: PayloadDto = {
        age: 35,
        name: 'Fulano',
        birthDate: new Date(1984, 5, 1, 0, 0, 0, 0),
        children: [
          { name: 'João', age: 10 },
          { name: 'Maria', age: 7 },
        ],
      };

      const createdId = 112;
      const responsePayload: PayloadDto = { id: createdId, ...requestPayload };

      const expected = createMockHttpResponse<PayloadDto>(responsePayload, 201, 'Created', { Location: `${url}/${createdId}` });
      jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(expected));

      // Act
      const response = await service.post<PayloadDto>(url, requestPayload);

      // Assert
      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith(url, requestPayload, defaultRequestConfig);
      expect(response).toEqual(expected);
      expect(response.headers.Location).toEqual(`${url}/${createdId}`);
    });
  });

  describe('CustomHttpService PUT', () => {
    it('should execute http put with success', async () => {
      // Arrange
      const id = 112;
      const url = `http://localhost:3000/api/persons/${id}`;

      const requestPayload: PayloadDto = {
        id,
        age: 39,
        name: 'Sicrano',
        birthDate: new Date(1980, 5, 1, 0, 0, 0, 0),
        children: [
          { name: 'João', age: 10 },
          { name: 'Maria', age: 7 },
        ],
      };

      const responsePayload: PayloadDto = {...requestPayload};

      const expected = createMockHttpResponse<PayloadDto>(responsePayload, 200, 'OK');
      jest.spyOn(httpService, 'put').mockImplementationOnce(() => of(expected));

      // Act
      const response = await service.put<PayloadDto>(url, requestPayload);

      // Assert
      expect(httpService.put).toHaveBeenCalledTimes(1);
      expect(httpService.put).toHaveBeenCalledWith(url, requestPayload, defaultRequestConfig);
      expect(response).toEqual(expected);
    });
  });

  describe('CustomHttpService DELETE', () => {
    it('should execute http delete with success', async () => {
      // Arrange
      const id = 112;
      const url = `http://localhost:3000/api/persons/${id}`;

      const responsePayload: boolean = true;

      const expected = createMockHttpResponse<boolean>(responsePayload, 200, 'OK');
      jest.spyOn(httpService, 'delete').mockImplementationOnce(() => of(expected));

      // Act
      const response = await service.delete<PayloadDto>(url);

      // Assert
      expect(httpService.delete).toHaveBeenCalledTimes(1);
      expect(httpService.delete).toHaveBeenCalledWith(url, defaultRequestConfig);
      expect(response).toEqual(expected);
    });
  });

  describe('CustomHttpService PATCH', () => {
    it('should execute http patch with success', async () => {
      // Arrange
      const id = 112;
      const url = `http://localhost:3000/api/persons/${id}`;

      const requestPayload: any = {
        age: 39,
        name: 'Sicrano',
      };

      const responsePayload: PayloadDto = {
        age: 39,
        name: 'Sicrano',
        birthDate: new Date(1984, 5, 1, 0, 0, 0, 0),
        children: [
          { name: 'João', age: 10 },
          { name: 'Maria', age: 7 },
        ],
      };

      const expected = createMockHttpResponse<PayloadDto>(responsePayload, 200, 'OK');
      jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(expected));

      // Act
      const response = await service.patch<PayloadDto>(url, requestPayload);

      // Assert
      expect(httpService.patch).toHaveBeenCalledTimes(1);
      expect(httpService.patch).toHaveBeenCalledWith(url, requestPayload, defaultRequestConfig);
      expect(response).toEqual(expected);
    });
  });
});
