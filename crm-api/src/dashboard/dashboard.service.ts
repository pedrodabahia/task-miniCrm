import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    const [
      totalClients,
      activeClients,
      inactiveClients,
      openOpportunities,
      closedOpportunities,
      pipeline,
      won,
      lost,
    ] = await Promise.all([
      this.prisma.client.count(),

      this.prisma.client.count({
        where: {
          status: 'ACTIVE',
        },
      }),

      this.prisma.client.count({
        where: {
          status: 'INACTIVE',
        },
      }),

      this.prisma.opportunity.count({
        where: {
          status: 'OPEN',
        },
      }),

      this.prisma.opportunity.count({
        where: {
          status: 'CLOSED',
        },
      }),

      this.prisma.opportunity.aggregate({
        _sum: {
          estimatedValue: true,
        },
        where: {
          status: 'OPEN',
        },
      }),

      this.prisma.opportunity.aggregate({
        _sum: {
          estimatedValue: true,
        },
        where: {
          stage: 'GANHA',
        },
      }),

      this.prisma.opportunity.aggregate({
        _sum: {
          estimatedValue: true,
        },
        where: {
          stage: 'PERDIDA',
        },
      }),
    ]);

    return {
      totalClients,
      activeClients,
      inactiveClients,
      openOpportunities,
      closedOpportunities,
      totalPipelineValue: pipeline._sum.estimatedValue ?? 0,
      totalWonValue: won._sum.estimatedValue ?? 0,
      totalLostValue: lost._sum.estimatedValue ?? 0,
    };
  }
}