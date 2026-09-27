import type { IHttpClient } from '@/lib/http/HttpClient';
import type { DashboardData } from '@/types';
import type { IDashboardRepository } from './IDashboardRepository';

export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly http: IHttpClient) {}

  get(): Promise<DashboardData> {
    return this.http.get<DashboardData>('/dashboard');
  }
}
