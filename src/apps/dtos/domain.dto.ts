import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class DomainDto {
  @ApiModelProperty()
  customerId: string;

  @IsNotEmpty()
  @ApiModelProperty()
  appName: string;

  @IsNotEmpty()
  @ApiModelProperty()
  integrationId: string;

  @IsNotEmpty()
  @ApiModelProperty()
  domain: string;
}
