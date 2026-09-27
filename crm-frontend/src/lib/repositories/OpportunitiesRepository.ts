import type { IHttpClient } from '@/lib/http/HttpClient';
import type { Opportunity, PaginatedResponse } from '@/types';
import type {
  IOpportunitiesRepository,
  OpportunityFilters,
  CreateOpportunityBody,
  UpdateOpportunityBody,
} from './IOpportunitiesRepository';

export class OpportunitiesRepository implements IOpportunitiesRepository {
  constructor(private readonly http: IHttpClient) {}

  list(filters: OpportunityFilters = {}): Promise<PaginatedResponse<Opportunity>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.status) params.set('status', filters.status);
    if (filters.clientId) params.set('clientId', filters.clientId);
    if (filters.minimumValue != null) params.set('minimumValue', String(filters.minimumValue));
    if (filters.maximumValue != null) params.set('maximumValue', String(filters.maximumValue));
    const qs = params.toString();
    return this.http.get<PaginatedResponse<Opportunity>>(`/opportunities${qs ? `?${qs}` : ''}`);
  }

  getById(id: string): Promise<Opportunity> {
    return this.http.get<Opportunity>(`/opportunities/${id}`);
  }

  create(body: CreateOpportunityBody): Promise<Opportunity> {
    return this.http.post<Opportunity>('/opportunities', body);
  }

  update(id: string, body: UpdateOpportunityBody): Promise<Opportunity> {
    return this.http.patch<Opportunity>(`/opportunities/${id}`, body);
  }
}
