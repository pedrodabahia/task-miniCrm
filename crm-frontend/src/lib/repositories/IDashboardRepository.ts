import type { DashboardData } from '@/types';

export interface IDashboardRepository {
  get(): Promise<DashboardData>;
}
