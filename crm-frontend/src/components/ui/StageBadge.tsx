import { Badge } from './Badge';
import type { OpportunityStage } from '@/types';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted';

const stageConfig: Record<OpportunityStage, { label: string; variant: BadgeVariant }> = {
  LEAD: { label: 'Lead', variant: 'muted' },
  QUALIFICACAO: { label: 'Qualificação', variant: 'info' },
  PROPOSTA: { label: 'Proposta', variant: 'warning' },
  NEGOCIACAO: { label: 'Negociação', variant: 'default' },
  GANHA: { label: 'Ganha', variant: 'success' },
  PERDIDA: { label: 'Perdida', variant: 'danger' },
};

export function StageBadge({ stage }: { stage: OpportunityStage }) {
  const { label, variant } = stageConfig[stage];
  return <Badge variant={variant}>{label}</Badge>;
}

export const stageLabel = (stage: OpportunityStage): string => stageConfig[stage].label;
