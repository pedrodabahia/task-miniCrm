import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateClientDto } from './create-client.dto.js';
import { ClientStatus } from '../../generated/prisma/client.js';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}