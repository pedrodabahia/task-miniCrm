import { api } from './api';
import type { Client} from '@/types';

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

export const clientsApi = {
list: (filters: ClientFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const qs = params.toString();

  return api.get<Client[]>(`/clients${qs ? `?${qs}` : ''}`);
},
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (body: CreateClientBody) => api.post<Client>('/clients', body),
  update: (id: string, body: UpdateClientBody) =>
    api.patch<Client>(`/clients/${id}`, body),
  deactivate: (id: string) => api.patch<Client>(`/clients/${id}`, { status: 'INACTIVE' }),
  delete: (id: string) => api.delete<void>(`/clients/${id}`),
};
