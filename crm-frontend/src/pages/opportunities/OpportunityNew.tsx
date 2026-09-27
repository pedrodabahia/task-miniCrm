import { useNavigate } from 'react-router-dom';
import { useOpportunitiesRepository } from '@/lib/di/ServicesContext';
import { mapApiError } from '@/lib/format';
import { OpportunityForm } from '@/components/forms/OpportunityForm';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import type { CreateOpportunityBody } from '@/lib/repositories/IOpportunitiesRepository';

export default function OpportunityNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const opportunitiesRepository = useOpportunitiesRepository();

  async function handleSubmit(data: CreateOpportunityBody) {
    try {
      const opp = await opportunitiesRepository.create(data);
      toast.success('Oportunidade criada', `"${opp.title}" foi adicionada ao pipeline.`);
      navigate(`/opportunities/${opp.id}`);
    } catch (err: any) {
      toast.error('Erro ao criar oportunidade', mapApiError(err.statusCode));
      throw err;
    }
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nova oportunidade</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          A oportunidade será criada como Lead (aberta) automaticamente.
        </p>
      </div>
      <Card>
        <OpportunityForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/opportunities')}
          submitLabel="Criar oportunidade"
        />
      </Card>
    </div>
  );
}
