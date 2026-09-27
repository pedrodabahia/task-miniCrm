import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, List, LayoutGrid } from 'lucide-react';
import {
  useOpportunitiesRepository,
  useClientsRepository,
} from '@/lib/di/ServicesContext';
import { formatDate, formatCurrency } from '@/lib/format';
import type { Client, Opportunity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { StageBadge } from '@/components/ui/StageBadge';
import { OpportunityStatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card } from '@/components/ui/Card';
import { OpportunityKanban } from '@/components/OpportunityKanban';

type ViewMode = 'table' | 'kanban';

export default function OpportunityList() {
  const navigate = useNavigate();
  const opportunitiesRepository = useOpportunitiesRepository();
  const clientsRepository = useClientsRepository();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const limit = viewMode === 'kanban' ? 100 : 10;

  useEffect(() => {
    clientsRepository
      .list({ limit: 100 })
      .then((r) => setClients(r.data))
      .catch(() => {});
  }, [clientsRepository]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await opportunitiesRepository.list({ page, limit, stage, status, clientId });
      setOpportunities(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Não foi possível carregar as oportunidades.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, stage, status, clientId, viewMode]);

  const filtered = search
    ? opportunities.filter((o) =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.client?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : opportunities;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Oportunidades</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} oportunidades` : 'Gerencie seu pipeline de vendas'}
          </p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => navigate('/opportunities/new')}>
          Nova oportunidade
        </Button>
      </div>

      <Card padding={false}>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Buscar oportunidade..."
              icon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              value={stage}
              onChange={(e) => { setStage(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'Todos os estágios' },
                { value: 'LEAD', label: 'Lead' },
                { value: 'QUALIFICACAO', label: 'Qualificação' },
                { value: 'PROPOSTA', label: 'Proposta' },
                { value: 'NEGOCIACAO', label: 'Negociação' },
                { value: 'GANHA', label: 'Ganha' },
                { value: 'PERDIDA', label: 'Perdida' },
              ]}
            />
          </div>
          <div className="w-36">
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'Todos os status' },
                { value: 'OPEN', label: 'Abertas' },
                { value: 'CLOSED', label: 'Fechadas' },
              ]}
            />
          </div>
          <div className="w-44">
            <Select
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'Todos os clientes' },
                ...clients.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List size={14} />
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : viewMode === 'kanban' ? (
          <div className="p-4">
            {loading ? (
              <div className="skeleton h-80 rounded-xl" />
            ) : (
              <OpportunityKanban opportunities={filtered} />
            )}
          </div>
        ) : (
          <>
            <Table
              keyExtractor={(o) => o.id}
              data={loading ? [] : filtered}
              columns={[
                {
                  key: 'title',
                  header: 'Título',
                  render: (o) => (
                    <div>
                      <p className="font-medium text-gray-900 max-w-xs truncate">{o.title}</p>
                      {o.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{o.description}</p>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'client',
                  header: 'Cliente',
                  render: (o) => (
                    <span className="text-gray-700">{o.client?.name || '—'}</span>
                  ),
                },
                {
                  key: 'value',
                  header: 'Valor',
                  render: (o) => (
                    <span className="font-semibold text-gray-900">{formatCurrency(o.estimatedValue)}</span>
                  ),
                },
                {
                  key: 'stage',
                  header: 'Estágio',
                  render: (o) => <StageBadge stage={o.stage} />,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (o) => <OpportunityStatusBadge status={o.status} />,
                },
                {
                  key: 'createdAt',
                  header: 'Criação',
                  render: (o) => (
                    <span className="text-gray-500 text-xs">{formatDate(o.createdAt)}</span>
                  ),
                },
                {
                  key: 'actions',
                  header: '',
                  className: 'w-20',
                  render: (o) => (
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/opportunities/${o.id}`)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/opportunities/${o.id}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={15} />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
            {loading && (
              <table className="w-full">
                <tbody>
                  <SkeletonTable rows={5} />
                </tbody>
              </table>
            )}
            {!loading && filtered.length === 0 && (
              <EmptyState
                title="Nenhuma oportunidade encontrada"
                description="Crie sua primeira oportunidade de venda."
                action={
                  <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => navigate('/opportunities/new')}
                  >
                    Nova oportunidade
                  </Button>
                }
              />
            )}
            {!loading && filtered.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
