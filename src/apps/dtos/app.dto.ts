import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AppDto {
  @ApiModelProperty()
  customerId: string;

  @IsNotEmpty()
  @ApiModelProperty()
  appName: string;

  @ApiModelProperty()
  integrationCount: number;

  @ApiModelProperty()
  active: boolean;
}
