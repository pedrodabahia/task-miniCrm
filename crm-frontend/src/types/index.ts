export type ClientStatus = 'ACTIVE' | 'INACTIVE';
export type OpportunityStatus = 'OPEN' | 'CLOSED';
export type OpportunityStage =
  | 'LEAD'
  | 'QUALIFICACAO'
  | 'PROPOSTA'
  | 'NEGOCIACAO'
  | 'GANHA'
  | 'PERDIDA';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  estimatedValue: number;
  stage: OpportunityStage;
  status: OpportunityStatus;
  clientId: string;
  client?: Pick<Client, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  openOpportunities: number;
  closedOpportunities: number;
  totalPipelineValue: number;
  totalWonValue: number;
  totalLostValue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
