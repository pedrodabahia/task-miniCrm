import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Opportunity, OpportunityStage } from '@/types';
import { StageBadge } from './ui/StageBadge';

const COLUMNS: { stage: OpportunityStage; label: string; color: string; bg: string }[] = [
  { stage: 'LEAD', label: 'Lead', color: 'border-gray-300', bg: 'bg-gray-50' },
  { stage: 'QUALIFICACAO', label: 'Qualificação', color: 'border-indigo-200', bg: 'bg-indigo-50/40' },
  { stage: 'PROPOSTA', label: 'Proposta', color: 'border-amber-200', bg: 'bg-amber-50/40' },
  { stage: 'NEGOCIACAO', label: 'Negociação', color: 'border-blue-200', bg: 'bg-blue-50/40' },
  { stage: 'GANHA', label: 'Ganha', color: 'border-green-200', bg: 'bg-green-50/40' },
  { stage: 'PERDIDA', label: 'Perdida', color: 'border-red-200', bg: 'bg-red-50/40' },
];

interface OpportunityKanbanProps {
  opportunities: Opportunity[];
}

export function OpportunityKanban({ opportunities }: OpportunityKanbanProps) {
  const navigate = useNavigate();

  const byStage = COLUMNS.reduce<Record<OpportunityStage, Opportunity[]>>(
    (acc, col) => {
      acc[col.stage] = opportunities.filter((o) => o.stage === col.stage);
      return acc;
    },
    {} as Record<OpportunityStage, Opportunity[]>,
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {COLUMNS.map(({ stage, label, color, bg }) => {
        const items = byStage[stage];
        const total = items.reduce((s, o) => s + o.estimatedValue, 0);

        return (
          <div key={stage} className="flex-none w-72">
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0 ${color} ${bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-600">
                  {items.length}
                </span>
              </div>
              {items.length > 0 && (
                <span className="text-[10px] text-gray-500 font-medium">{formatCurrency(total)}</span>
              )}
            </div>

            {/* Column body */}
            <div className={`rounded-b-xl border ${color} min-h-64 p-2 space-y-2 ${bg}`}>
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-xs text-gray-400">
                  Nenhuma oportunidade
                </div>
              ) : (
                items.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => navigate(`/opportunities/${opp.id}`)}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
                      {opp.title}
                    </p>
                    {opp.client && (
                      <p className="text-xs text-gray-400 mb-2 truncate">{opp.client.name}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-indigo-600">
                        <DollarSign size={12} />
                        <span className="text-xs font-semibold">
                          {formatCurrency(opp.estimatedValue)}
                        </span>
                      </div>
                      <StageBadge stage={opp.stage} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
