import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreateOpportunityDto } from './create-opportunity.dto.js';

export class UpdateOpportunityDto extends PartialType(
  OmitType(CreateOpportunityDto, ['status'] as const),
) {}