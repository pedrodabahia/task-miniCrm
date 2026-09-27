import type { IHttpClient } from '@/lib/http/HttpClient';
import type { Client, PaginatedResponse } from '@/types';
import type {
  IClientsRepository,
  ClientFilters,
  CreateClientBody,
  UpdateClientBody,
} from './IClientsRepository';

/**
 * Implementação concreta de IClientsRepository.
 * Recebe o IHttpClient por injeção de dependência via construtor — não
 * instancia nem importa nenhum cliente HTTP concreto.
 */
export class ClientsRepository implements IClientsRepository {
  constructor(private readonly http: IHttpClient) {}

  list(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();

    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    const qs = params.toString();

    return this.http.get<PaginatedResponse<Client>>(`/clients${qs ? `?${qs}` : ''}`);
  }

  getById(id: string): Promise<Client> {
    return this.http.get<Client>(`/clients/${id}`);
  }

  create(body: CreateClientBody): Promise<Client> {
    return this.http.post<Client>('/clients', body);
  }

  update(id: string, body: UpdateClientBody): Promise<Client> {
    return this.http.patch<Client>(`/clients/${id}`, body);
  }

  deactivate(id: string): Promise<Client> {
    return this.http.patch<Client>(`/clients/${id}`, { status: 'INACTIVE' });
  }

  delete(id: string): Promise<void> {
    return this.http.delete<void>(`/clients/${id}`);
  }
}
