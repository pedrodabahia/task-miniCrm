import { api } from './api';
import type { Contact } from '@/types';

export interface CreateContactBody {
  name: string;
  email: string;
  phone?: string;
  position?: string;
}

export interface UpdateContactBody {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
}

export const contactsApi = {
  listByClient: (clientId: string) =>
    api.get<Contact[]>(`/clients/${clientId}/contacts`),
  create: (clientId: string, body: CreateContactBody) =>
    api.post<Contact>(`/clients/${clientId}/contacts`, body),
  update: (id: string, body: UpdateContactBody) =>
    api.patch<Contact>(`/contacts/${id}`, body),
  delete: (id: string) => api.delete<void>(`/contacts/${id}`),
};
