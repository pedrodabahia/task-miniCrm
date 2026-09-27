import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { OpportunityFilterDto } from './dto/opportunity-filter.dto.js';
import {
  OpportunityStage,
  OpportunityStatus,
} from '../generated/prisma/client.js';

import { CreateOpportunityDto } from './dto/create-opportunity.dto.js';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto.js';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOpportunityDto: CreateOpportunityDto) {
    const client = await this.prisma.client.findUnique({
      where: {
        id: createOpportunityDto.clientId,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (client.status === 'INACTIVE') {
      throw new BadRequestException(
        'Cliente inativo não pode receber oportunidades',
      );
    }

    return this.prisma.opportunity.create({
      data: {
        title: createOpportunityDto.title,
        description: createOpportunityDto.description,
        estimatedValue: createOpportunityDto.estimatedValue,
        stage: OpportunityStage.LEAD,
        status: OpportunityStatus.OPEN,
        clientId: createOpportunityDto.clientId,
      },
    });
  }

async findAll(filters: OpportunityFilterDto) {
  const {
    stage,
    status,
    clientId,
    minimumValue,
    maximumValue,
    page = 1,
    limit = 10,
  } = filters;

  if (
  minimumValue !== undefined &&
  maximumValue !== undefined &&
  minimumValue > maximumValue
) {
  throw new BadRequestException(
    'maximumValue deve ser maior ou igual a minimumValue',
  );
}

  const where = {
    ...(stage && { stage }),
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...((minimumValue !== undefined || maximumValue !== undefined) && {
      estimatedValue: {
        ...(minimumValue !== undefined && { gte: minimumValue }),
        ...(maximumValue !== undefined && { lte: maximumValue }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    this.prisma.opportunity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),

    this.prisma.opportunity.count({
      where,
    }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: {
        id,
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada');
    }

    return opportunity;
  }

  async update(
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
  ) {
    const opportunity = await this.findOne(id);

    if (opportunity.status === OpportunityStatus.CLOSED) {
      throw new BadRequestException(
        'Oportunidade fechada não pode ser alterada',
      );
    }

    if (updateOpportunityDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: {
          id: updateOpportunityDto.clientId,
        },
      });

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      if (client.status === 'INACTIVE') {
        throw new BadRequestException(
          'Cliente inativo não pode receber oportunidades',
        );
      }
    }

    if (updateOpportunityDto.stage) {
      this.validateStageTransition(
        opportunity.stage,
        updateOpportunityDto.stage,
      );
    }

  let status: OpportunityStatus = opportunity.status;

    if (
      updateOpportunityDto.stage === OpportunityStage.GANHA ||
      updateOpportunityDto.stage === OpportunityStage.PERDIDA
    ) {
      status = OpportunityStatus.CLOSED;
    }

    return this.prisma.opportunity.update({
      where: {
        id,
      },
      data: {
        ...updateOpportunityDto,
        status,
      },
    });
  }

  private validateStageTransition(
    currentStage: OpportunityStage,
    newStage: OpportunityStage,
  ) {
    const validTransitions: Record<
      OpportunityStage,
      OpportunityStage[]
    > = {
      [OpportunityStage.LEAD]: [
        OpportunityStage.QUALIFICACAO,
      ],

      [OpportunityStage.QUALIFICACAO]: [
        OpportunityStage.PROPOSTA,
      ],

      [OpportunityStage.PROPOSTA]: [
        OpportunityStage.NEGOCIACAO,
      ],

      [OpportunityStage.NEGOCIACAO]: [
        OpportunityStage.GANHA,
        OpportunityStage.PERDIDA,
      ],

      [OpportunityStage.GANHA]: [],

      [OpportunityStage.PERDIDA]: [],
    };

    if (
      currentStage === newStage
    ) {
      return;
    }

    if (
      !validTransitions[currentStage].includes(newStage)
    ) {
      throw new BadRequestException(
        `Transição inválida: ${currentStage} → ${newStage}`,
      );
    }
  }
}