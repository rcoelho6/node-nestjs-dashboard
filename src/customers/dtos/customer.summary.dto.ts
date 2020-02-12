import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class CustomerSummaryDto {
  @ApiModelProperty()
  id: string;

  @IsNotEmpty()
  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  active: boolean;

  @ApiModelProperty()
  hasContextualAccess: boolean;

  @ApiModelProperty()
  hasAllowme2faAccess: boolean;

  @ApiModelProperty()
  hasTrustedOnBoardAccess: boolean;
}
