import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class CustomerDetailsDto {
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

  // Optionals

  @ApiModelProperty()
  fingerprintFreshness: number;

  @ApiModelProperty()
  contextualStreamNameTransactionCreated: string;

  @ApiModelProperty()
  contextualStreamNameTransactionUpdated: string;

  @ApiModelProperty()
  allowme2faSubdomain: string;

  @ApiModelProperty()
  allowme2faCustomerId: number;

  @ApiModelProperty()
  allowme2faIgnoreGatewaysId: string;

  @ApiModelProperty()
  codename: string;

  @ApiModelProperty()
  secret: string;

  // TODO: reaproveitar o que o Rafa fez
  // @ApiModelProperty()
  // applications: ApplicationDto[];
}
