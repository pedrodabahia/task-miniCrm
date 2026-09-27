# Mini CRM

Sistema de CRM simples para gestão de clientes, contatos e pipeline de oportunidades comerciais. Projeto desenvolvido como teste técnico, cobrindo modelagem de dados, regras de negócio, API REST e frontend.

## Estrutura do repositório

```text
task-MiniCrm/
├── crm-api/        # API REST (NestJS + Prisma + PostgreSQL)
├── crm-frontend/   # Frontend (React + Vite + Tailwind)
└── docs/           # Documentação de modelagem e arquitetura
```

| Pasta          | O que é                                                              | README                              |
|----------------|-----------------------------------------------------------------------|--------------------------------------|
| `crm-api`      | API REST que expõe clientes, contatos, oportunidades e dashboard    | [`crm-api/README.md`](./crm-api/README.md) |
| `crm-frontend` | SPA que consome a API (dashboard, listagens, kanban, formulários)   | [`crm-frontend/README.md`](./crm-frontend/README.md) |
| `docs`         | Documentos de modelagem do banco e arquitetura completa do sistema  | —                                     |

## Stack

- **Backend:** Node.js, NestJS, TypeScript, Prisma ORM, PostgreSQL, Docker, Vitest, Swagger/OpenAPI
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router 7

## Domínio

```text
Client
 ├── Contact          (1:N)
 └── Opportunity      (1:N)
```

Pipeline de oportunidades:

```text
LEAD → QUALIFICACAO → PROPOSTA → NEGOCIACAO → GANHA / PERDIDA
```

`GANHA` e `PERDIDA` são estados finais e fecham a oportunidade (`CLOSED`) automaticamente. As regras de negócio completas (unicidade de email/documento, cliente inativo não recebe oportunidade, transições de estágio, etc.) estão documentadas no [`crm-api/README.md`](./crm-api/README.md).

## Como rodar o projeto completo

### 1. Subir a API (com banco de dados)

```bash
cd crm-api
docker compose up --build
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`

Alternativa sem Docker (API local + Postgres à parte) e detalhes de seed/migrations: ver [`crm-api/README.md`](./crm-api/README.md).

### 2. Subir o frontend

Em outro terminal:

```bash
cd crm-frontend
npm install
npm run dev
```

- Frontend: `http://localhost:8443` (porta configurável via `PORT`)
- O frontend aponta para a API através da variável `VITE_API_URL` (padrão `http://localhost:3000`)

Detalhes da arquitetura do frontend (camadas HTTP, repositórios e injeção de dependências) estão em [`crm-frontend/README.md`](./crm-frontend/README.md).

## Documentação adicional

A pasta [`docs/`](./docs) contém:

- `Arquitetura_Completa_Mini_CRM.docx` — visão geral de arquitetura do sistema
- `modelagem-crm-regras-banco.docx` — modelagem do banco e regras de negócio
- `crm-modelagem.drawio` — diagrama de modelagem (abrir com [draw.io](https://app.diagrams.net/))

## Testes

Os testes automatizados vivem no `crm-api` (unitários e E2E, cobrindo as regras de negócio de maior risco). Ver instruções em [`crm-api/README.md`](./crm-api/README.md#testes).
