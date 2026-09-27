import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit,
  ArrowRight,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import { useOpportunitiesRepository } from '@/lib/di/ServicesContext';
import { formatDate, formatCurrency, mapApiError } from '@/lib/format';
import type { Opportunity, OpportunityStage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StageBadge, stageLabel } from '@/components/ui/StageBadge';
import { OpportunityStatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const STAGE_ORDER: OpportunityStage[] = [
  'LEAD',
  'QUALIFICACAO',
  'PROPOSTA',
  'NEGOCIACAO',
  'GANHA',
];

const NEXT_STAGE: Partial<Record<OpportunityStage, OpportunityStage[]>> = {
  LEAD: ['QUALIFICACAO'],
  QUALIFICACAO: ['PROPOSTA'],
  PROPOSTA: ['NEGOCIACAO'],
  NEGOCIACAO: ['GANHA', 'PERDIDA'],
};

function PipelineVisual({ stage }: { stage: OpportunityStage }) {
  const stages: OpportunityStage[] = ['LEAD', 'QUALIFICACAO', 'PROPOSTA', 'NEGOCIACAO'];
  const isGanha = stage === 'GANHA';
  const isPerdida = stage === 'PERDIDA';
  const isClosed = isGanha || isPerdida;
  const currentIndex = stages.indexOf(stage);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((s, i) => {
        const isActive = s === stage;
        const isPast = !isClosed && i <= currentIndex;
        const isDone = !isClosed && i < currentIndex;

        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${isActive ? 'bg-indigo-600 text-white' : isDone ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {isDone && <CheckCircle size={12} />}
              {stageLabel(s)}
            </div>
            {i < stages.length - 1 && (
              <ArrowRight size={12} className={isPast && !isActive ? 'text-indigo-300' : 'text-gray-200'} />
            )}
          </div>
        );
      })}
      {isClosed && (
        <div className="flex items-center gap-1">
          <ArrowRight size={12} className="text-gray-200" />
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              ${isGanha ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}
          >
            {isGanha ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {stageLabel(stage)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advanceTarget, setAdvanceTarget] = useState<OpportunityStage | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const opportunitiesRepository = useOpportunitiesRepository();

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const o = await opportunitiesRepository.getById(id);
      setOpp(o);
    } catch {
      setError('Oportunidade não encontrada.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleAdvance() {
    if (!opp || !advanceTarget || !id) return;
    setAdvancing(true);
    try {
      const updated = await opportunitiesRepository.update(id, { stage: advanceTarget });
      setOpp(updated);
      setAdvanceTarget(null);
      toast.success(
        'Estágio atualizado',
        `Oportunidade avançou para ${stageLabel(advanceTarget)}.`,
      );
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
    } finally {
      setAdvancing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !opp) {
    return <ErrorState message={error || 'Oportunidade não encontrada.'} onRetry={load} />;
  }

  const isClosed = opp.status === 'CLOSED';
  const nextStages = NEXT_STAGE[opp.stage] || [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StageBadge stage={opp.stage} />
            <OpportunityStatusBadge status={opp.status} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{opp.title}</h1>
          {opp.client && (
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <User size={12} />
              {opp.client.name}
            </p>
          )}
        </div>
        {!isClosed && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit size={14} />}
            onClick={() => navigate(`/opportunities/${opp.id}/edit`)}
          >
            Editar
          </Button>
        )}
      </div>

      {/* Pipeline visual */}
      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline</p>
        <PipelineVisual stage={opp.stage} />

        {/* Advance controls */}
        {!isClosed && nextStages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Avançar para:</span>
            {nextStages.map((next) => {
              const isWin = next === 'GANHA';
              const isLoss = next === 'PERDIDA';
              return (
                <button
                  key={next}
                  onClick={() => setAdvanceTarget(next)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                    ${isWin ? 'border-green-300 text-green-700 hover:bg-green-50' : isLoss ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'}`}
                >
                  {isWin && <CheckCircle size={12} />}
                  {isLoss && <XCircle size={12} />}
                  {!isWin && !isLoss && <ArrowRight size={12} />}
                  {stageLabel(next)}
                </button>
              );
            })}
          </div>
        )}
        {isClosed && (
          <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Esta oportunidade está fechada e não pode ser alterada.
          </p>
        )}
      </Card>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          icon={<DollarSign size={16} className="text-indigo-600" />}
          label="Valor estimado"
          value={formatCurrency(opp.estimatedValue)}
          bg="bg-indigo-50"
        />
        <InfoCard
          icon={<User size={16} className="text-gray-500" />}
          label="Cliente"
          value={opp.client?.name || '—'}
          bg="bg-gray-50"
        />
        <InfoCard
          icon={<Calendar size={16} className="text-gray-500" />}
          label="Criado em"
          value={formatDate(opp.createdAt)}
          bg="bg-gray-50"
        />
        <InfoCard
          icon={<Calendar size={16} className="text-gray-500" />}
          label="Atualizado em"
          value={formatDate(opp.updatedAt)}
          bg="bg-gray-50"
        />
      </div>

      {/* Description */}
      {opp.description && (
        <Card>
          <div className="flex items-center gap-1.5 text-gray-400 mb-2">
            <FileText size={14} />
            <p className="text-xs font-semibold uppercase tracking-wide">Descrição</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{opp.description}</p>
        </Card>
      )}

      {/* Confirm advance */}
      <ConfirmDialog
        open={!!advanceTarget}
        onClose={() => setAdvanceTarget(null)}
        onConfirm={handleAdvance}
        title="Avançar estágio"
        description={`Deseja avançar esta oportunidade para "${advanceTarget ? stageLabel(advanceTarget) : ''}"?${advanceTarget === 'GANHA' || advanceTarget === 'PERDIDA' ? ' Esta ação fechará a oportunidade.' : ''}`}
        confirmLabel="Confirmar"
        confirmVariant={advanceTarget === 'PERDIDA' ? 'danger' : 'primary'}
        loading={advancing}
      />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-200 p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
