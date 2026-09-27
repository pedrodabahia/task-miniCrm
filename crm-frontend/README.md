# MiniCRM — Frontend

Frontend do MiniCRM: gestão de clientes, contatos e pipeline de oportunidades de venda (dashboard, lista/kanban, formulários).

## Stack

- **React 19** + **TypeScript**
- **Vite 8** (build/dev server) com plugin do Figma Make
- **Tailwind CSS v4** (via `@tailwindcss/vite`, sem arquivo de config)
- **React Router 7**
- **lucide-react** para ícones

## Como rodar

```bash
pnpm install
pnpm dev       # inicia o servidor de desenvolvimento (porta padrão 8443)
pnpm build     # build de produção
pnpm preview   # serve o build de produção localmente
pnpm format    # formata o código com oxfmt
```

### Variáveis de ambiente

| Variável       | Padrão                  | Descrição                          |
|----------------|--------------------------|-------------------------------------|
| `VITE_API_URL` | `http://localhost:3000`  | URL base da API do `crm-api`       |

O app espera que a API (`../crm-api`) esteja rodando e acessível nessa URL.

## Estrutura do projeto

```
src/
├── main.tsx                 # entrypoint React
├── App.tsx                  # rotas + providers globais (Services, Toast, Router)
├── index.css                # entrypoint global do Tailwind v4
├── types/                   # tipos de domínio compartilhados (Client, Contact, Opportunity, ...)
├── components/
│   ├── ui/                  # componentes de UI genéricos (Button, Input, Modal, Table, Toast, ...)
│   ├── layout/               # Layout, Header, Sidebar
│   ├── forms/                 # formulários de domínio (ClientForm, ContactForm, OpportunityForm)
│   └── OpportunityKanban.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── clients/               # ClientList, ClientDetail, ClientNew, ClientEdit
│   └── opportunities/         # OpportunityList, OpportunityDetail, OpportunityNew, OpportunityEdit
└── lib/
    ├── format.ts             # helpers puros de formatação (moeda, data, mensagens de erro)
    ├── http/                 # abstração HTTP (ver arquitetura abaixo)
    ├── repositories/         # acesso a dados por entidade (ver arquitetura abaixo)
    └── di/                   # composição e injeção de dependências (ver arquitetura abaixo)
```

## Arquitetura de acesso a dados (SOLID + Injeção de Dependências)

Toda comunicação com a API passa por três camadas, pensadas para seguir os princípios SOLID:

```
Página/Componente
      │  (usa hooks, ex: useClientsRepository())
      ▼
useServices() / ServicesProvider      ← src/lib/di
      │  (injeta a implementação concreta)
      ▼
IClientsRepository (interface)        ← src/lib/repositories
      │
      ▼
ClientsRepository (implementação)     ← src/lib/repositories
      │  (depende só de IHttpClient, nunca de fetch direto)
      ▼
IHttpClient (interface)               ← src/lib/http
      │
      ▼
FetchHttpClient (implementação)       ← src/lib/http
```

### `lib/http` — camada HTTP

- `HttpClient.ts` — interface `IHttpClient` (`get`/`post`/`patch`/`delete`) e a classe `ApiError`.
- `FetchHttpClient.ts` — única implementação que conhece a Fetch API do browser. Recebe a `baseUrl` pelo construtor.

Nenhuma outra camada importa `fetch` diretamente — todas dependem da abstração `IHttpClient` (**Dependency Inversion Principle**).

### `lib/repositories` — acesso a dados por entidade

Um par de arquivos por entidade (`Clients`, `Contacts`, `Opportunities`, `Dashboard`):

- `I{Entidade}Repository.ts` — a interface (porta) + os tipos de filtro/body usados pela UI (`CreateClientBody`, `ClientFilters`, etc). Cada entidade tem sua própria interface, sem métodos que não usa (**Interface Segregation Principle**).
- `{Entidade}Repository.ts` — implementação concreta, recebe um `IHttpClient` no construtor e só conhece os endpoints daquela entidade (**Single Responsibility Principle**).

Trocar de HTTP para outra fonte de dados (GraphQL, mock, IndexedDB) significa criar uma nova classe que implementa a mesma interface — nada na UI muda (**Open/Closed** e **Liskov Substitution Principle**: qualquer implementação da interface pode substituir outra sem quebrar quem a consome).

### `lib/di` — injeção de dependências

- `container.ts` — *composition root*: único lugar do projeto que instancia as classes concretas e monta o grafo de dependências (`createContainer`, `defaultContainer`).
- `ServicesContext.tsx` — expõe o container para a árvore React via `ServicesProvider` e os hooks `useClientsRepository`, `useContactsRepository`, `useOpportunitiesRepository`, `useDashboardRepository` (e o genérico `useServices()`).

`App.tsx` envolve toda a aplicação com `<ServicesProvider>`, usando o container padrão (`defaultContainer`, que fala com a API real via `FetchHttpClient`). Páginas e componentes nunca importam um repositório concreto — sempre pedem a interface através do hook:

```tsx
const clientsRepository = useClientsRepository();
const { data } = await clientsRepository.list({ page: 1, limit: 10 });
```

### Por que isso ajuda

- **Testabilidade**: dá pra montar um container de teste com repositórios mockados e injetar via `<ServicesProvider services={testContainer}>`, sem precisar mockar `fetch` ou módulos globais.
- **Baixo acoplamento**: nenhuma página conhece a implementação HTTP; só a interface do repositório que usa.
- **Extensibilidade**: uma nova fonte de dados ou um novo endpoint não exige alterar páginas existentes — só implementar a interface correspondente e trocar no container.

## Convenções

- Tipos de domínio (`Client`, `Contact`, `Opportunity`, `DashboardData`, etc.) ficam em `src/types`.
- Tipos de request/response específicos de cada entidade (`CreateClientBody`, `OpportunityFilters`, ...) ficam junto da interface do repositório correspondente, em `src/lib/repositories`.
- Formatação de moeda/data e mapeamento de erros de API (`mapApiError`) ficam em `src/lib/format.ts`, como funções puras sem estado.
- O alias `@` aponta para `src/` (configurado em `vite.config.ts` e `tsconfig.json`).
