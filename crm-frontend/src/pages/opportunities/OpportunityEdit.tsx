import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpportunitiesRepository } from '@/lib/di/ServicesContext';
import { mapApiError } from '@/lib/format';
import type { Opportunity } from '@/types';
import type { CreateOpportunityBody } from '@/lib/repositories/IOpportunitiesRepository';
import { OpportunityForm } from '@/components/forms/OpportunityForm';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';

export default function OpportunityEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const opportunitiesRepository = useOpportunitiesRepository();

  useEffect(() => {
    if (!id) return;
    opportunitiesRepository
      .getById(id)
      .then(setOpp)
      .catch(() => setError('Oportunidade não encontrada.'))
      .finally(() => setLoading(false));
  }, [id, opportunitiesRepository]);

  async function handleSubmit(data: CreateOpportunityBody & { stage?: Opportunity['stage'] }) {
    if (!id) return;
    try {
      await opportunitiesRepository.update(id, data);
      toast.success('Oportunidade atualizada', 'As alterações foram salvas.');
      navigate(`/opportunities/${id}`);
    } catch (err: any) {
      toast.error('Erro ao salvar', mapApiError(err.statusCode));
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !opp) return <ErrorState message={error || 'Oportunidade não encontrada.'} />;

  if (opp.status === 'CLOSED') {
    return (
      <ErrorState
        title="Oportunidade fechada"
        message="Não é possível editar uma oportunidade fechada."
      />
    );
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Editar oportunidade</h1>
        <p className="text-sm text-gray-500 mt-0.5">Atualize os dados de "{opp.title}".</p>
      </div>
      <Card>
        <OpportunityForm
          initialValues={{
            title: opp.title,
            description: opp.description || '',
            estimatedValue: String(opp.estimatedValue),
            clientId: opp.clientId,
            stage: opp.stage,
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/opportunities/${id}`)}
          submitLabel="Salvar alterações"
          showStage={true}
        />
      </Card>
    </div>
  );
}
