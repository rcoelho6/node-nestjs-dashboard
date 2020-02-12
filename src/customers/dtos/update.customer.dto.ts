import { IsNotEmpty, IsBoolean, ValidateIf, IsNumber, IsPositive } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @IsNotEmpty()
  @ApiModelProperty()
  name: string;

  @IsBoolean()
  @ApiModelProperty()
  active: boolean;

  @IsBoolean()
  @ApiModelProperty()
  hasContextualAccess: boolean;

  @IsBoolean()
  @ApiModelProperty()
  hasAllowme2faAccess: boolean;

  @IsBoolean()
  @ApiModelProperty()
  hasTrustedOnBoardAccess: boolean;

  // Optionals

  @ValidateIf(o => o.hasContextualAccess === true)
  @IsNumber()
  @IsPositive()
  @ApiModelProperty()
  fingerprintFreshness: number;

  @ValidateIf(o => o.hasAllowme2faAccess === true)
  @IsNotEmpty()
  @ApiModelProperty()
  allowme2faSubdomain: string;

  @ValidateIf(o => o.hasAllowme2faAccess === true)
  @IsNumber()
  @IsPositive()
  @ApiModelProperty()
  allowme2faCustomerId: number;

  @ValidateIf(o => o.hasAllowme2faAccess === true)
  @ApiModelProperty()
  allowme2faIgnoreGatewaysId: string;

  @ValidateIf(o => o.hasTrustedOnBoardAccess === true)
  @IsNotEmpty()
  @ApiModelProperty()
  codename: string;
}
