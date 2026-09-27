import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    clientId: string,
    createContactDto: CreateContactDto,
  ) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.contact.create({
      data: {
        ...createContactDto,
        clientId,
      },
    });
  }

  async findByClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.contact.findMany({
      where: {
        clientId,
      },
    });
  }

async update(
  id: string,
  updateContactDto: UpdateContactDto,
) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    return this.prisma.contact.delete({
      where: { id },
    });
  }
}