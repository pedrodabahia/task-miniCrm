import type { IHttpClient } from '@/lib/http/HttpClient';
import type { Contact } from '@/types';
import type {
  IContactsRepository,
  CreateContactBody,
  UpdateContactBody,
} from './IContactsRepository';

export class ContactsRepository implements IContactsRepository {
  constructor(private readonly http: IHttpClient) {}

  listByClient(clientId: string): Promise<Contact[]> {
    return this.http.get<Contact[]>(`/clients/${clientId}/contacts`);
  }

  create(clientId: string, body: CreateContactBody): Promise<Contact> {
    return this.http.post<Contact>(`/clients/${clientId}/contacts`, body);
  }

  update(id: string, body: UpdateContactBody): Promise<Contact> {
    return this.http.patch<Contact>(`/contacts/${id}`, body);
  }

  delete(id: string): Promise<void> {
    return this.http.delete<void>(`/contacts/${id}`);
  }
}
