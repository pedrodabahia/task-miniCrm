import { Badge } from './Badge';
import type { ClientStatus, OpportunityStatus } from '@/types';

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'muted'}>
      {status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

export function OpportunityStatusBadge({ status }: { status: OpportunityStatus }) {
  return (
    <Badge variant={status === 'OPEN' ? 'info' : 'muted'}>
      {status === 'OPEN' ? 'Aberta' : 'Fechada'}
    </Badge>
  );
}
