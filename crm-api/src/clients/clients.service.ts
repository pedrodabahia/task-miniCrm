
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { ClientFilterDto } from './dto/client-filter.dto.js';


@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

async create(createClientDto: CreateClientDto) {
  try {
    return await this.prisma.client.create({
      data: createClientDto,
    });
  } catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const target = error.meta?.target;

    if (Array.isArray(target) && target.includes('email')) {
      throw new ConflictException('Email já cadastrado');
    }

    if (Array.isArray(target) && target.includes('document')) {
      throw new ConflictException('Documento já cadastrado');
    }

    throw new ConflictException('Email ou documento já cadastrado');
  }

  throw error;
}
}

async findAll(filters: ClientFilterDto) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ClientWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [data, total] = await Promise.all([
    this.prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    this.prisma.client.count({
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
  const client = await this.prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    throw new NotFoundException('Cliente não encontrado');
  }

  return client;
}

async update(id: string, updateClientDto: UpdateClientDto) {
  await this.findOne(id);

  try {
    return await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = error.meta?.target;

      if (Array.isArray(target) && target.includes('email')) {
        throw new ConflictException('Email já cadastrado');
      }

      if (Array.isArray(target) && target.includes('document')) {
        throw new ConflictException('Documento já cadastrado');
      }

      throw new ConflictException(
        'Email ou documento já cadastrado',
      );
    }

    throw error;
  }
}

async remove(id: string) {
  await this.findOne(id);

const [opportunitiesCount, contactsCount] = await Promise.all([
  this.prisma.opportunity.count({
    where: {
      clientId: id,
    },
  }),
  this.prisma.contact.count({
    where: {
      clientId: id,
    },
  }),
]);

if (opportunitiesCount > 0 || contactsCount > 0) {
  return this.prisma.client.update({
    where: { id },
    data: {
      status: 'INACTIVE',
    },
  });
}

  return this.prisma.client.delete({
    where: { id },
  });
}
}
