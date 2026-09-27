import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  CheckCircle,
  AlertOctagon,
  DollarSign,
  Trophy,
  Plus,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  useDashboardRepository,
  useOpportunitiesRepository,
} from '@/lib/di/ServicesContext';
import { formatCurrency, formatDate } from '@/lib/format';
import type { DashboardData, Opportunity } from '@/types';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StageBadge } from '@/components/ui/StageBadge';
import { OpportunityStatusBadge } from '@/components/ui/StatusBadge';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function MetricCard({ label, value, icon, color, sub }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-gray-900">{value}</p>

      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const STAGES = [
  'LEAD',
  'QUALIFICACAO',
  'PROPOSTA',
  'NEGOCIACAO',
  'GANHA',
  'PERDIDA',
] as const;

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  QUALIFICACAO: 'Qualificação',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHA: 'Ganha',
  PERDIDA: 'Perdida',
};

const STAGE_COLORS = [
  'bg-gray-300',
  'bg-indigo-300',
  'bg-indigo-400',
  'bg-indigo-500',
  'bg-green-500',
  'bg-red-400',
];

export default function Dashboard() {
  const navigate = useNavigate();

  const dashboardRepository = useDashboardRepository();
  const opportunitiesRepository = useOpportunitiesRepository();

  const [data, setData] = useState<DashboardData | null>(null);
  const [recent, setRecent] = useState<Opportunity[]>([]);

  const [stageCounts, setStageCounts] = useState<Record<string, number>>({
    LEAD: 0,
    QUALIFICACAO: 0,
    PROPOSTA: 0,
    NEGOCIACAO: 0,
    GANHA: 0,
    PERDIDA: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const stageRequests = STAGES.map((stage) =>
        opportunitiesRepository.list({
          stage,
          page: 1,
          limit: 1,
        }),
      );

      const [dashboard, opp, ...stageResults] = await Promise.all([
        dashboardRepository.get(),
        opportunitiesRepository.list({
          page: 1,
          limit: 5,
        }),
        ...stageRequests,
      ]);

      setData(dashboard);
      setRecent(opp.data);

      const counts: Record<string, number> = {};

      STAGES.forEach((stage, index) => {
        counts[stage] = stageResults[index]?.total ?? 0;
      });

      setStageCounts(counts);
    } catch {
      setError('Não foi possível carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const totalPipeline =
    data?.openOpportunities != null && data?.totalPipelineValue != null
      ? data.totalPipelineValue
      : 0;

  const maxStageCount = Math.max(
    ...STAGES.map((stage) => stageCounts[stage] ?? 0),
    1,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visão geral do seu negócio
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate('/clients/new')}
          >
            Novo cliente
          </Button>

          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate('/opportunities/new')}
          >
            Nova oportunidade
          </Button>
        </div>
      </div>

      {/* Metrics grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total de clientes"
              value={data?.totalClients ?? 0}
              icon={<Users size={18} className="text-indigo-600" />}
              color="bg-indigo-50"
            />

            <MetricCard
              label="Clientes ativos"
              value={data?.activeClients ?? 0}
              icon={<UserCheck size={18} className="text-green-600" />}
              color="bg-green-50"
              sub={`${data?.inactiveClients ?? 0} inativos`}
            />

            <MetricCard
              label="Oportunidades abertas"
              value={data?.openOpportunities ?? 0}
              icon={<TrendingUp size={18} className="text-indigo-600" />}
              color="bg-indigo-50"
              sub={`${data?.closedOpportunities ?? 0} fechadas`}
            />

            <MetricCard
              label="Pipeline total"
              value={formatCurrency(totalPipeline)}
              icon={<Activity size={18} className="text-amber-600" />}
              color="bg-amber-50"
            />

            <MetricCard
              label="Oportunidades ganhas"
              value={formatCurrency(data?.totalWonValue ?? 0)}
              icon={<Trophy size={18} className="text-green-600" />}
              color="bg-green-50"
            />

            <MetricCard
              label="Oportunidades perdidas"
              value={formatCurrency(data?.totalLostValue ?? 0)}
              icon={<AlertOctagon size={18} className="text-red-500" />}
              color="bg-red-50"
            />

            <MetricCard
              label="Oportunidades ganhas (qtd)"
              value={stageCounts.GANHA}
              icon={<CheckCircle size={18} className="text-green-600" />}
              color="bg-green-50"
            />

            <MetricCard
              label="Clientes inativos"
              value={data?.inactiveClients ?? 0}
              icon={<UserX size={18} className="text-gray-500" />}
              color="bg-gray-100"
            />
          </div>

          {/* Pipeline funnel */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Funil de vendas
                </h3>

                <p className="text-xs text-gray-400 mt-0.5">
                  Distribuição por estágio
                </p>
              </div>

              <button
                onClick={() => navigate('/opportunities')}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Ver todas <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex items-end gap-2 h-32">
              {STAGES.map((stage, i) => {
                const count = stageCounts[stage] ?? 0;

                const height =
                  count === 0
                    ? '20%'
                    : `${Math.max(20, (count / maxStageCount) * 100)}%`;

                return (
                  <div
                    key={stage}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                  >
                    <span className="text-[11px] font-semibold text-gray-600">
                      {count}
                    </span>

                    <div
                      className={`w-full rounded-t ${STAGE_COLORS[i]} transition-all duration-300`}
                      style={{ height }}
                      title={`${STAGE_LABELS[stage]}: ${count}`}
                    />

                    <p className="text-[10px] text-gray-500 text-center truncate w-full">
                      {STAGE_LABELS[stage]}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Recent opportunities */}
      <Card padding={false}>
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Oportunidades recentes
            </h3>

            <p className="text-xs text-gray-400 mt-0.5">
              Últimas 5 oportunidades
            </p>
          </div>

          <button
            onClick={() => navigate('/opportunities')}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            Ver todas <ArrowRight size={12} />
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Nenhuma oportunidade encontrada.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <DollarSign size={14} className="text-indigo-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {opp.title}
                      </p>

                      <p className="text-xs text-gray-400 truncate">
                        {opp.client?.name || 'Cliente'} ·{' '}
                        {formatDate(opp.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <StageBadge stage={opp.stage} />
                    <OpportunityStatusBadge status={opp.status} />

                    <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                      {formatCurrency(opp.estimatedValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}