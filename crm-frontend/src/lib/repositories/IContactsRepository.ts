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

export interface IContactsRepository {
  listByClient(clientId: string): Promise<Contact[]>;
  create(clientId: string, body: CreateContactBody): Promise<Contact>;
  update(id: string, body: UpdateContactBody): Promise<Contact>;
  delete(id: string): Promise<void>;
}
