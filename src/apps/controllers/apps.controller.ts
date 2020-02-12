import { Controller, Get, UseGuards, ParseUUIDPipe, Param } from '@nestjs/common';
import {
  ApiUseTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse,
  ApiUnauthorizedResponse, ApiNotFoundResponse, ApiConflictResponse, ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppDto } from '../dtos/app.dto';
import { AppsService } from '../services/apps.service';
import { IntegrationDto } from '../dtos/integration.dto';
import { DomainDto } from '../dtos/domain.dto';

@ApiUseTags('applications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@Controller('/api/v1/customers/:customerId/apps')
export class AppsController {
  constructor(private customerService: AppsService) {}

  @Get()
  getByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string): Promise<AppDto[]> {
    const result = this.customerService.getByCustomer(customerId);
    return result;
  }

  @Get(':appName/integrations')
  getIntegrationsByAppId(@Param('customerId', ParseUUIDPipe) customerId: string, @Param('appName') appName: string): Promise<IntegrationDto[]> {
    const result = this.customerService.getIntegrationsByAppId(customerId, appName);
    return result;
  }

  @Get(':appName/integrations/:integrationId/domains')
  getDomainsByIntegrationId(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('appName') appName: string,
    @Param('integrationId', ParseUUIDPipe) integrationId: string,
  ): Promise<DomainDto[]> {
    const result = this.customerService.getDomainsByIntegrationId(customerId, appName, integrationId);
    return result;
  }
}
