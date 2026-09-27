import type { Client, PaginatedResponse } from '@/types';

export interface ClientFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CreateClientBody {
  name: string;
  email: string;
  phone?: string;
  document: string;
}

export interface UpdateClientBody {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

/**
 * Porta (abstração) para persistência de clientes.
 * Páginas e componentes dependem apenas desta interface, nunca da
 * implementação HTTP concreta (DIP).
 */
export interface IClientsRepository {
  list(filters?: ClientFilters): Promise<PaginatedResponse<Client>>;
  getById(id: string): Promise<Client>;
  create(body: CreateClientBody): Promise<Client>;
  update(id: string, body: UpdateClientBody): Promise<Client>;
  deactivate(id: string): Promise<Client>;
  delete(id: string): Promise<void>;
}
