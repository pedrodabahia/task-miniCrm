import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest';

import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Opportunities (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let activeClientId: string;
  let inactiveClientId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.opportunity.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.client.deleteMany();

    const activeClient = await prisma.client.create({
      data: {
        name: 'Cliente Ativo Teste',
        email: `ativo-${Date.now()}@teste.com`,
        document: `DOC-${Date.now()}-1`,
        status: 'ACTIVE',
      },
    });

    const inactiveClient = await prisma.client.create({
      data: {
        name: 'Cliente Inativo Teste',
        email: `inativo-${Date.now()}@teste.com`,
        document: `DOC-${Date.now()}-2`,
        status: 'INACTIVE',
      },
    });

    activeClientId = activeClient.id;
    inactiveClientId = inactiveClient.id;
  });

  afterAll(async () => {
    await prisma.opportunity.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.client.deleteMany();

    await app.close();
  });

  it('deve criar uma oportunidade para cliente ativo', async () => {
    const response = await request(app.getHttpServer())
      .post('/opportunities')
      .send({
        title: 'Projeto CRM',
        description: 'Sistema de CRM',
        estimatedValue: 5000,
        clientId: activeClientId,
      })
      .expect(201);

    expect(response.body.title).toBe('Projeto CRM');
    expect(response.body.stage).toBe('LEAD');
    expect(response.body.status).toBe('OPEN');
    expect(response.body.clientId).toBe(activeClientId);
  });

  it('não deve criar oportunidade para cliente inexistente', async () => {
    await request(app.getHttpServer())
      .post('/opportunities')
      .send({
        title: 'Projeto inválido',
        estimatedValue: 1000,
        clientId: '00000000-0000-0000-0000-000000000000',
      })
      .expect(404);
  });

  it('não deve criar oportunidade para cliente inativo', async () => {
    await request(app.getHttpServer())
      .post('/opportunities')
      .send({
        title: 'Projeto cliente inativo',
        estimatedValue: 1000,
        clientId: inactiveClientId,
      })
      .expect(400);
  });

  it('não deve aceitar valor negativo', async () => {
    await request(app.getHttpServer())
      .post('/opportunities')
      .send({
        title: 'Projeto inválido',
        estimatedValue: -100,
        clientId: activeClientId,
      })
      .expect(400);
  });

  it('não deve permitir pular etapas', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/opportunities')
      .send({
        title: 'Projeto CRM',
        estimatedValue: 5000,
        clientId: activeClientId,
      })
      .expect(201);

    const opportunityId = createResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/opportunities/${opportunityId}`)
      .send({
        stage: 'PROPOSTA',
      })
      .expect(400);
  });

  it('deve permitir avançar pelas etapas corretamente', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/opportunities')
      .send({
        title: 'Projeto CRM',
        estimatedValue: 5000,
        clientId: activeClientId,
      })
      .expect(201);

    const opportunityId = createResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/opportunities/${opportunityId}`)
      .send({
        stage: 'QUALIFICACAO',
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/opportunities/${opportunityId}`)
      .send({
        stage: 'PROPOSTA',
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/opportunities/${opportunityId}`)
      .send({
        stage: 'NEGOCIACAO',
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/opportunities/${opportunityId}`)
      .expect(200);

    expect(response.body.stage).toBe('NEGOCIACAO');
    expect(response.body.status).toBe('OPEN');
  });

  it('deve fechar automaticamente quando a oportunidade for GANHA', async () => {
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Oportunidade ganha',
        estimatedValue: 10000,
        clientId: activeClientId,
        stage: 'NEGOCIACAO',
        status: 'OPEN',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/opportunities/${opportunity.id}`)
      .send({
        stage: 'GANHA',
      })
      .expect(200);

    expect(response.body.stage).toBe('GANHA');
    expect(response.body.status).toBe('CLOSED');
  });

  it('deve fechar automaticamente quando a oportunidade for PERDIDA', async () => {
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Oportunidade perdida',
        estimatedValue: 10000,
        clientId: activeClientId,
        stage: 'NEGOCIACAO',
        status: 'OPEN',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/opportunities/${opportunity.id}`)
      .send({
        stage: 'PERDIDA',
      })
      .expect(200);

    expect(response.body.stage).toBe('PERDIDA');
    expect(response.body.status).toBe('CLOSED');
  });

  it('não deve permitir alterar oportunidade fechada', async () => {
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Oportunidade fechada',
        estimatedValue: 10000,
        clientId: activeClientId,
        stage: 'GANHA',
        status: 'CLOSED',
      },
    });

    await request(app.getHttpServer())
      .patch(`/opportunities/${opportunity.id}`)
      .send({
        title: 'Tentativa de alteração',
      })
      .expect(400);
  });
  it('deve filtrar oportunidades por stage e status', async () => {
  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Lead 1',
        estimatedValue: 1000,
        clientId: activeClientId,
        stage: 'LEAD',
        status: 'OPEN',
      },
      {
        title: 'Proposta 1',
        estimatedValue: 5000,
        clientId: activeClientId,
        stage: 'PROPOSTA',
        status: 'OPEN',
      },
      {
        title: 'Proposta ganha',
        estimatedValue: 10000,
        clientId: activeClientId,
        stage: 'GANHA',
        status: 'CLOSED',
      },
    ],
  });

  const response = await request(app.getHttpServer())
    .get('/opportunities')
    .query({
      stage: 'PROPOSTA',
      status: 'OPEN',
    })
    .expect(200);

  expect(response.body.total).toBe(1);
  expect(response.body.data).toHaveLength(1);
  expect(response.body.data[0].title).toBe('Proposta 1');
});

it('deve filtrar oportunidades por faixa de valor', async () => {
  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Oportunidade 1',
        estimatedValue: 500,
        clientId: activeClientId,
      },
      {
        title: 'Oportunidade 2',
        estimatedValue: 3000,
        clientId: activeClientId,
      },
      {
        title: 'Oportunidade 3',
        estimatedValue: 8000,
        clientId: activeClientId,
      },
    ],
  });

  

  const response = await request(app.getHttpServer())
    .get('/opportunities')
    .query({
      minimumValue: 2000,
      maximumValue: 5000,
    })
    .expect(200);

  expect(response.body.total).toBe(1);
  expect(response.body.data[0].title).toBe('Oportunidade 2');
});

it('deve rejeitar faixa de valor inválida', async () => {
  await request(app.getHttpServer())
    .get('/opportunities')
    .query({
      minimumValue: 5000,
      maximumValue: 1000,
    })
    .expect(400);
});

it('deve paginar oportunidades', async () => {
  await prisma.opportunity.createMany({
    data: Array.from({ length: 15 }, (_, index) => ({
      title: `Oportunidade ${index + 1}`,
      estimatedValue: (index + 1) * 1000,
      clientId: activeClientId,
    })),
  });

  const response = await request(app.getHttpServer())
    .get('/opportunities')
    .query({
      page: 2,
      limit: 10,
    })
    .expect(200);

  expect(response.body.page).toBe(2);
  expect(response.body.limit).toBe(10);
  expect(response.body.total).toBe(15);
  expect(response.body.totalPages).toBe(2);
  expect(response.body.data).toHaveLength(5);
});
it('deve rejeitar email duplicado', async () => {
  await request(app.getHttpServer())
    .post('/clients')
    .send({
      name: 'Cliente 1',
      email: 'duplicado@email.com',
      document: '11111111111',
    })
    .expect(201);

  await request(app.getHttpServer())
    .post('/clients')
    .send({
      name: 'Cliente 2',
      email: 'duplicado@email.com',
      document: '22222222222',
    })
    .expect(409);
});

it('deve rejeitar documento duplicado', async () => {
  await request(app.getHttpServer())
    .post('/clients')
    .send({
      name: 'Cliente 1',
      email: 'cliente1@email.com',
      document: '11111111111',
    })
    .expect(201);

  await request(app.getHttpServer())
    .post('/clients')
    .send({
      name: 'Cliente 2',
      email: 'cliente2@email.com',
      document: '11111111111',
    })
    .expect(409);
});

it('deve inativar cliente que possui oportunidades ao invés de excluir', async () => {
  const createResponse = await request(app.getHttpServer())
    .post('/opportunities')
    .send({
      title: 'Oportunidade de teste',
      estimatedValue: 1000,
      clientId: activeClientId,
    })
    .expect(201);

  expect(createResponse.body.clientId).toBe(activeClientId);

  const response = await request(app.getHttpServer())
    .delete(`/clients/${activeClientId}`)
    .expect(200);

  expect(response.body.id).toBe(activeClientId);
  expect(response.body.status).toBe('INACTIVE');

  const client = await prisma.client.findUnique({
    where: {
      id: activeClientId,
    },
  });

  expect(client).not.toBeNull();
  expect(client?.status).toBe('INACTIVE');
});
it('deve criar um contato para um cliente existente', async () => {
  const response = await request(app.getHttpServer())
    .post(`/clients/${activeClientId}/contacts`)
    .send({
      name: 'João da Silva',
      email: 'joao@email.com',
      phone: '77999999999',
      position: 'Gerente',
    })
    .expect(201);

  expect(response.body.name).toBe('João da Silva');
  expect(response.body.email).toBe('joao@email.com');
  expect(response.body.clientId).toBe(activeClientId);
});

it('não deve criar contato para cliente inexistente', async () => {
  await request(app.getHttpServer())
    .post('/clients/00000000-0000-0000-0000-000000000000/contacts')
    .send({
      name: 'Contato inválido',
      email: 'contato@email.com',
    })
    .expect(404);
});

it('deve listar os contatos de um cliente', async () => {
  await prisma.contact.createMany({
    data: [
      {
        name: 'Contato 1',
        email: 'contato1@email.com',
        clientId: activeClientId,
      },
      {
        name: 'Contato 2',
        email: 'contato2@email.com',
        clientId: activeClientId,
      },
    ],
  });

  const response = await request(app.getHttpServer())
    .get(`/clients/${activeClientId}/contacts`)
    .expect(200);

  expect(response.body).toHaveLength(2);
  expect(response.body[0].clientId).toBe(activeClientId);
  expect(response.body[1].clientId).toBe(activeClientId);
});

it('deve editar um contato parcialmente', async () => {
  const contact = await prisma.contact.create({
    data: {
      name: 'Contato Original',
      email: 'original@email.com',
      phone: '77999999999',
      clientId: activeClientId,
    },
  });

  const response = await request(app.getHttpServer())
    .patch(`/contacts/${contact.id}`)
    .send({
      phone: '77888888888',
    })
    .expect(200);

  expect(response.body.name).toBe('Contato Original');
  expect(response.body.phone).toBe('77888888888');
  expect(response.body.email).toBe('original@email.com');
});

it('não deve editar contato inexistente', async () => {
  await request(app.getHttpServer())
    .patch('/contacts/00000000-0000-0000-0000-000000000000')
    .send({
      name: 'Novo nome',
    })
    .expect(404);
});

it('deve excluir um contato', async () => {
  const contact = await prisma.contact.create({
    data: {
      name: 'Contato para excluir',
      email: 'excluir@email.com',
      clientId: activeClientId,
    },
  });

  await request(app.getHttpServer())
    .delete(`/contacts/${contact.id}`)
    .expect(200);

  const deletedContact = await prisma.contact.findUnique({
    where: {
      id: contact.id,
    },
  });

  expect(deletedContact).toBeNull();
});

it('não deve excluir contato inexistente', async () => {
  await request(app.getHttpServer())
    .delete('/contacts/00000000-0000-0000-0000-000000000000')
    .expect(404);
});

it('não deve aceitar email inválido no contato', async () => {
  await request(app.getHttpServer())
    .post(`/clients/${activeClientId}/contacts`)
    .send({
      name: 'Contato inválido',
      email: 'email-invalido',
    })
    .expect(400);
});
it('deve retornar os dados corretos do dashboard', async () => {
  const secondClient = await prisma.client.create({
    data: {
      name: 'Segundo Cliente',
      email: 'segundo@email.com',
      document: '99999999999',
      status: 'ACTIVE',
    },
  });

  await prisma.client.update({
    where: {
      id: activeClientId,
    },
    data: {
      status: 'INACTIVE',
    },
  });

  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Oportunidade aberta',
        estimatedValue: 5000,
        clientId: secondClient.id,
        stage: 'PROPOSTA',
        status: 'OPEN',
      },
      {
        title: 'Oportunidade ganha',
        estimatedValue: 10000,
        clientId: secondClient.id,
        stage: 'GANHA',
        status: 'CLOSED',
      },
      {
        title: 'Oportunidade perdida',
        estimatedValue: 3000,
        clientId: secondClient.id,
        stage: 'PERDIDA',
        status: 'CLOSED',
      },
    ],
  });

  const response = await request(app.getHttpServer())
    .get('/dashboard')
    .expect(200);

expect(response.body.totalClients).toBe(3);
expect(response.body.activeClients).toBe(1);
expect(response.body.inactiveClients).toBe(2);

await prisma.client.update({
  where: {
    id: activeClientId,
  },
  data: {
    status: 'INACTIVE',
  },
});

  expect(response.body.openOpportunities).toBe(1);
  expect(response.body.closedOpportunities).toBe(2);

  expect(Number(response.body.totalPipelineValue)).toBe(5000);
  expect(Number(response.body.totalWonValue)).toBe(10000);
  expect(Number(response.body.totalLostValue)).toBe(3000);
});
it('não deve permitir alterar status manualmente', async () => {
  const opportunity = await prisma.opportunity.create({
    data: {
      title: 'Oportunidade teste',
      estimatedValue: 5000,
      clientId: activeClientId,
      stage: 'LEAD',
      status: 'OPEN',
    },
  });

  await request(app.getHttpServer())
    .patch(`/opportunities/${opportunity.id}`)
    .send({
      status: 'CLOSED',
    })
    .expect(400);
});
});