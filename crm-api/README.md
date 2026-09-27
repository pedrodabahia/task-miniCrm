# Mini CRM API

API REST para gerenciamento de clientes, contatos e oportunidades comerciais.

Projeto desenvolvido como teste técnico, com foco em regras de negócio, modelagem relacional, validação, organização de código, tratamento de erros, testes e escalabilidade.

## Tecnologias

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Docker Compose
- Vitest
- Supertest
- Swagger/OpenAPI

## Requisitos

- Node.js 24+
- Docker
- Docker Compose

## Executando com Docker

```bash
docker compose up --build
```

API: `http://localhost:3000`

Swagger: `http://localhost:3000/docs`

Health check: `http://localhost:3000/health`

Para encerrar:

```bash
docker compose down
```

O Docker Compose inicia o PostgreSQL e a aplicação. As migrations são aplicadas durante a inicialização da aplicação e os dados do PostgreSQL são persistidos através de volume Docker.

## Executando localmente

Instale as dependências:

```bash
npm install
```

Configure o `.env`:

```env
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db"
```

Certifique-se de que o PostgreSQL esteja disponível.

Execute as migrations:

```bash
npx prisma migrate dev --config ./prisma.config.ts
```

Gere o Prisma Client:

```bash
npx prisma generate --config ./prisma.config.ts
```

Inicie a aplicação:

```bash
npm run start:dev
```

API: `http://localhost:3000`

Swagger: `http://localhost:3000/docs`

Health check: `http://localhost:3000/health`

## Seed

O projeto possui um seed com dados iniciais para facilitar testes e demonstração.

```bash
npm run seed
```

## Testes

Todos os testes:

```bash
npm test
```

Testes E2E:

```bash
npm run test:e2e
```

Com detalhes:

```bash
npm run test:e2e -- --reporter=verbose
```

Os testes priorizam as regras de negócio de maior risco, incluindo:

- email de cliente duplicado;
- documento de cliente duplicado;
- cliente inativo não pode receber oportunidades;
- transições inválidas de estágio;
- oportunidade fechada não pode ser alterada;
- oportunidade ganha é automaticamente fechada;
- oportunidade perdida é automaticamente fechada;
- cliente com oportunidades não é excluído fisicamente;
- validações de contatos;
- filtros e paginação;
- regras do dashboard.

# Endpoints

## Clientes

| Método | Rota |
|---|---|
| POST | `/clients` |
| GET | `/clients` |
| GET | `/clients/:id` |
| PATCH | `/clients/:id` |
| DELETE | `/clients/:id` |

O `GET /clients` permite `page`, `limit`, `status` e `search`.

Exemplo:

```text
GET /clients?status=ACTIVE&search=empresa&page=1&limit=10
```

## Contatos

| Método | Rota |
|---|---|
| POST | `/clients/:clientId/contacts` |
| GET | `/clients/:clientId/contacts` |
| PATCH | `/contacts/:id` |
| DELETE | `/contacts/:id` |

## Oportunidades

| Método | Rota |
|---|---|
| POST | `/opportunities` |
| GET | `/opportunities` |
| GET | `/opportunities/:id` |
| PATCH | `/opportunities/:id` |

## Dashboard

| Método | Rota |
|---|---|
| GET | `/dashboard` |

# Regras de Negócio

## Clientes

- Nome é obrigatório.
- Email deve ser válido e único.
- Documento deve ser único.
- Cliente pode possuir status `ACTIVE` ou `INACTIVE`.
- Clientes inativos não podem receber novas oportunidades.
- Clientes com oportunidades não são excluídos fisicamente.
- Ao tentar excluir um cliente que possui oportunidades, seu status passa para `INACTIVE`.
- Um cliente inativo pode ser reativado através da atualização de seu status.

## Contatos

- Todo contato deve pertencer a um cliente.
- O cliente precisa existir para que um contato seja criado.
- O email do contato, quando informado, deve ser válido.

## Oportunidades

Fluxo:

```text
LEAD
  ↓
QUALIFICACAO
  ↓
PROPOSTA
  ↓
NEGOCIACAO
  ↓
GANHA / PERDIDA
```

Não é permitido pular etapas.

Transições permitidas:

- `LEAD → QUALIFICACAO`
- `QUALIFICACAO → PROPOSTA`
- `PROPOSTA → NEGOCIACAO`
- `NEGOCIACAO → GANHA`
- `NEGOCIACAO → PERDIDA`

`GANHA` e `PERDIDA` são estados finais.

Ao atingir `GANHA` ou `PERDIDA`, a oportunidade passa automaticamente para `CLOSED`.

Uma oportunidade `CLOSED` não pode mais ser alterada.

Novas oportunidades só podem ser criadas para clientes `ACTIVE`.

# Filtros e Paginação

O endpoint de oportunidades permite:

- `stage`
- `status`
- `clientId`
- `minimumValue`
- `maximumValue`

Exemplo:

```text
GET /opportunities?stage=PROPOSTA&status=OPEN
```

Paginação:

```text
GET /opportunities?page=1&limit=10
```

Resposta:

```json
{
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

Os filtros podem ser combinados com a paginação:

```text
GET /opportunities?status=OPEN&minimumValue=1000&page=1&limit=10
```

# Dashboard

O endpoint `/dashboard` apresenta:

- total de clientes;
- clientes ativos;
- clientes inativos;
- oportunidades abertas;
- oportunidades fechadas;
- valor total do pipeline;
- valor total ganho;
- valor total perdido.

O pipeline considera oportunidades `OPEN`. O valor ganho considera o estágio `GANHA`. O valor perdido considera o estágio `PERDIDA`.

# Modelagem do Banco de Dados

Entidades principais:

```text
Client
 ├── Contact
 └── Opportunity
```

Relacionamentos:

- `Client 1:N Contact`
- `Client 1:N Opportunity`

O banco utiliza:

- UUIDs como identificadores;
- constraints de unicidade para email e documento;
- campos obrigatórios com `NOT NULL`;
- enums para status e etapas;
- índices para campos utilizados em relacionamentos e filtros;
- timestamps de criação e atualização;
- chaves estrangeiras para garantir a integridade dos relacionamentos.

# Arquitetura

A aplicação segue uma arquitetura modular utilizando NestJS:

```text
HTTP
 ↓
Controller
 ↓
DTO / Validation
 ↓
Service
 ↓
Prisma ORM
 ↓
PostgreSQL
```

**Controller:** recebe as requisições HTTP e encaminha para os services.

**DTO:** define e valida os dados recebidos pela API.

**Service:** implementa as regras de negócio.

**Prisma:** realiza a comunicação entre a aplicação e o banco.

**PostgreSQL:** realiza a persistência dos dados.

# Validação e Tratamento de Erros

A API utiliza validação global dos dados recebidos e rejeita propriedades não esperadas.

Códigos HTTP utilizados:

- `400 Bad Request` — dados inválidos ou regra de negócio inválida;
- `404 Not Found` — recurso não encontrado;
- `409 Conflict` — conflito de unicidade ou estado.

As exceções são tratadas por um filtro global com resposta padronizada.

Exemplo:

```json
{
  "statusCode": 400,
  "message": "Mensagem do erro",
  "timestamp": "2026-09-27T00:00:00.000Z",
  "path": "/opportunities"
}
```

# Banco de Dados

O projeto utiliza PostgreSQL executado através do Docker.

O Prisma é utilizado como ORM e as alterações do banco são controladas através de migrations.

A conexão é configurada através da variável `DATABASE_URL`.

O arquivo `.env` não deve ser versionado no Git. Um `.env.example` é disponibilizado para referência.

# Variáveis de Ambiente

```env
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db"
```

Em ambiente Docker, a aplicação utiliza o serviço `postgres` como host do banco de dados.

# Estrutura do Projeto

```text
src/
├── clients/
│   ├── dto/
│   ├── clients.controller.ts
│   ├── clients.service.ts
│   └── clients.module.ts
├── contacts/
│   ├── dto/
│   ├── contacts.controller.ts
│   ├── contacts.service.ts
│   └── contacts.module.ts
├── opportunities/
│   ├── dto/
│   ├── opportunities.controller.ts
│   ├── opportunities.service.ts
│   └── opportunities.module.ts
├── dashboard/
│   ├── dashboard.controller.ts
│   ├── dashboard.service.ts
│   └── dashboard.module.ts
├── health/
│   ├── health.controller.ts
│   └── health.module.ts
├── common/
│   ├── filters/
│   └── interceptors/
├── prisma/
│   └── prisma.service.ts
└── main.ts

prisma/
├── migrations/
├── schema.prisma
└── seed.ts

Dockerfile
docker-compose.yml
prisma.config.ts
```

# Documentação da API

A documentação interativa está disponível através do Swagger:

`http://localhost:3000/docs`

# Health Check

```text
GET /health
```

O endpoint verifica a disponibilidade da aplicação e da conexão com o banco.

# Escalabilidade

Caso o sistema evolua de aproximadamente 1.000 para 1.000.000 de oportunidades, os primeiros pontos a serem revisados seriam:

1. índices do banco de dados;
2. desempenho das consultas;
3. consultas de agregação utilizadas pelo dashboard;
4. paginação;
5. possíveis problemas de N+1 queries;
6. volume e frequência das consultas.

A partir das métricas de uso e dos gargalos identificados, poderiam ser avaliadas estratégias adicionais, como cache, réplicas de leitura, particionamento, otimização de consultas e processamento assíncrono.

A ideia é primeiro identificar o gargalo real através de métricas e análise das consultas antes de adicionar complexidade à infraestrutura.

# Licença

Projeto desenvolvido como parte de um teste técnico para avaliação de conhecimentos em desenvolvimento de APIs, modelagem de dados, regras de negócio, banco de dados, testes e arquitetura de software.