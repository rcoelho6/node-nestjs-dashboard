import { IsNotEmpty, IsOptional, IsArray, ValidateIf } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class IntegrationDto {
  @ApiModelProperty()
  customerId: string;

  @IsNotEmpty()
  @ApiModelProperty()
  name: string;

  @IsNotEmpty()
  @ApiModelProperty()
  integrationId: string;

  @ApiModelProperty()
  domainsCount: number;

  @ApiModelProperty()
  fingerpringSimilarity: number;

  @ApiModelProperty()
  newDeviceSimilarity: number;

  @ApiModelProperty()
  fingerprintFreshness: number;

  @ApiModelProperty()
  featureTolerance: number;

  @ApiModelProperty()
  expiriationTime: number;

  @ApiModelProperty()
  maxAuthAttempts: number;

  @ApiModelProperty()
  codeExpirationTime: number;

  @ApiModelProperty()
  maxCodeSubmission: number;

  @ApiModelProperty()
  codeSubmissionInterval: number;

  @ApiModelProperty()
  capabilities: string[];

  @ApiModelProperty()
  reuseCode: boolean;

  @ApiModelProperty()
  checkCodeInUtc: boolean;

  @ApiModelProperty()
  expirationTimeRange: number;

  @ApiModelProperty()
  whitelistActive: boolean;

  @IsOptional()
  @IsArray()
  @ValidateIf(ips => ips.every(ip => validator.isIP(ip)))
  @ApiModelProperty()
  whilelistIps: string[];

  @ApiModelProperty()
  contextualActive: boolean;

  @ApiModelProperty()
  contextualEndpoint: string;

  @ApiModelProperty()
  contextualUser: string;

  @ApiModelProperty()
  contextualPassword: string;
}
