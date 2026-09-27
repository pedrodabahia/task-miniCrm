import { api } from './api';
import type { Opportunity, PaginatedResponse, OpportunityStage } from '@/types';

export interface OpportunityFilters {
  page?: number;
  limit?: number;
  stage?: string;
  status?: string;
  clientId?: string;
  minimumValue?: number;
  maximumValue?: number;
}

export interface CreateOpportunityBody {
  title: string;
  description?: string;
  estimatedValue: number;
  clientId: string;
}

export interface UpdateOpportunityBody {
  title?: string;
  description?: string;
  estimatedValue?: number;
  clientId?: string;
  stage?: OpportunityStage;
}

export const opportunitiesApi = {
  list: (filters: OpportunityFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.status) params.set('status', filters.status);
    if (filters.clientId) params.set('clientId', filters.clientId);
    if (filters.minimumValue != null) params.set('minimumValue', String(filters.minimumValue));
    if (filters.maximumValue != null) params.set('maximumValue', String(filters.maximumValue));
    const qs = params.toString();
    return api.get<PaginatedResponse<Opportunity>>(`/opportunities${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => api.get<Opportunity>(`/opportunities/${id}`),
  create: (body: CreateOpportunityBody) =>
    api.post<Opportunity>('/opportunities', body),
  update: (id: string, body: UpdateOpportunityBody) =>
    api.patch<Opportunity>(`/opportunities/${id}`, body),
};
