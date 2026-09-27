import { Module } from '@nestjs/common';

import { OpportunitiesController } from './opportunities.controller.js';
import { OpportunitiesService } from './opportunities.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, PrismaService],
})
export class OpportunitiesModule {}