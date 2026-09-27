import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  ClientStatus,
  OpportunityStage,
  OpportunityStatus,
} from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://crm_user:crm_password@localhost:5432/crm_db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  const client1 = await prisma.client.upsert({
    where: { email: 'contato@alvoradatech.com' },
    update: {},
    create: {
      name: 'Alvorada Tecnologia',
      email: 'contato@alvoradatech.com',
      phone: '(73) 99999-1001',
      document: '12345678000101',
      status: ClientStatus.ACTIVE,
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: 'contato@novahorizonte.com' },
    update: {},
    create: {
      name: 'Nova Horizonte Comércio',
      email: 'contato@novahorizonte.com',
      phone: '(73) 99999-1002',
      document: '12345678000102',
      status: ClientStatus.ACTIVE,
    },
  });

  const client3 = await prisma.client.upsert({
    where: { email: 'contato@empresaexemplo.com' },
    update: {},
    create: {
      name: 'Empresa Exemplo',
      email: 'contato@empresaexemplo.com',
      phone: '(73) 99999-1003',
      document: '12345678000103',
      status: ClientStatus.INACTIVE,
    },
  });

  await prisma.contact.upsert({
    where: {
      id: '11111111-1111-1111-1111-111111111111',
    },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Carlos Oliveira',
      email: 'carlos@alvoradatech.com',
      phone: '(73) 99999-2001',
      position: 'Diretor Comercial',
      clientId: client1.id,
    },
  });

  await prisma.contact.upsert({
    where: {
      id: '22222222-2222-2222-2222-222222222222',
    },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Mariana Santos',
      email: 'mariana@novahorizonte.com',
      phone: '(73) 99999-2002',
      position: 'Gerente',
      clientId: client2.id,
    },
  });

  await prisma.opportunity.upsert({
    where: {
      id: '33333333-3333-3333-3333-333333333333',
    },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Implantação de CRM',
      description: 'Implantação do sistema CRM para equipe comercial.',
      estimatedValue: 15000,
      stage: OpportunityStage.PROPOSTA,
      status: OpportunityStatus.OPEN,
      clientId: client1.id,
    },
  });

  await prisma.opportunity.upsert({
    where: {
      id: '44444444-4444-4444-4444-444444444444',
    },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444444',
      title: 'Projeto de E-commerce',
      description: 'Desenvolvimento de plataforma de vendas online.',
      estimatedValue: 28000,
      stage: OpportunityStage.NEGOCIACAO,
      status: OpportunityStatus.OPEN,
      clientId: client2.id,
    },
  });

  console.log('✅ Seed concluído!');
  console.log(`Clientes: ${3}`);
  console.log(`Contatos: ${2}`);
  console.log(`Oportunidades: ${2}`);
}

main()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });