import { FetchHttpClient } from '@/lib/http/FetchHttpClient';
import type { IHttpClient } from '@/lib/http/HttpClient';
import { ClientsRepository } from '@/lib/repositories/ClientsRepository';
import { ContactsRepository } from '@/lib/repositories/ContactsRepository';
import { OpportunitiesRepository } from '@/lib/repositories/OpportunitiesRepository';
import { DashboardRepository } from '@/lib/repositories/DashboardRepository';
import type { IClientsRepository } from '@/lib/repositories/IClientsRepository';
import type { IContactsRepository } from '@/lib/repositories/IContactsRepository';
import type { IOpportunitiesRepository } from '@/lib/repositories/IOpportunitiesRepository';
import type { IDashboardRepository } from '@/lib/repositories/IDashboardRepository';

/**
 * Conjunto de serviços (abstrações) que a aplicação consome.
 * Componentes e páginas dependem só destas interfaces — nunca das classes
 * concretas — o que permite trocar a implementação (ex: um mock em testes)
 * sem alterar nenhuma tela.
 */
export interface AppServices {
  clientsRepository: IClientsRepository;
  contactsRepository: IContactsRepository;
  opportunitiesRepository: IOpportunitiesRepository;
  dashboardRepository: IDashboardRepository;
}

/**
 * Composition root: único lugar do app que conhece as implementações
 * concretas e "monta" o grafo de dependências.
 */
export function createContainer(httpClient: IHttpClient): AppServices {
  return {
    clientsRepository: new ClientsRepository(httpClient),
    contactsRepository: new ContactsRepository(httpClient),
    opportunitiesRepository: new OpportunitiesRepository(httpClient),
    dashboardRepository: new DashboardRepository(httpClient),
  };
}

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

/**
 * Container padrão usado em produção/desenvolvimento, apontando para a API
 * real via fetch. Para testes, monte outro container com um IHttpClient
 * (ou repositórios) mockado e injete via <ServicesProvider services={...}>.
 */
export const defaultContainer: AppServices = createContainer(new FetchHttpClient(BASE_URL));
