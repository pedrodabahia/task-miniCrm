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

export interface IOpportunitiesRepository {
  list(filters?: OpportunityFilters): Promise<PaginatedResponse<Opportunity>>;
  getById(id: string): Promise<Opportunity>;
  create(body: CreateOpportunityBody): Promise<Opportunity>;
  update(id: string, body: UpdateOpportunityBody): Promise<Opportunity>;
}
