import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientsRepository } from '@/lib/di/ServicesContext';
import { mapApiError } from '@/lib/format';
import type { Client } from '@/types';
import type { CreateClientBody } from '@/lib/repositories/IClientsRepository';
import { ClientForm } from '@/components/forms/ClientForm';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';

export default function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientsRepository = useClientsRepository();

  useEffect(() => {
    if (!id) return;
    clientsRepository
      .getById(id)
      .then(setClient)
      .catch(() => setError('Cliente não encontrado.'))
      .finally(() => setLoading(false));
  }, [id, clientsRepository]);

  async function handleSubmit(data: CreateClientBody) {
    if (!id) return;
    try {
      await clientsRepository.update(id, data);
      toast.success('Cliente atualizado', 'As alterações foram salvas.');
      navigate(`/clients/${id}`);
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

  if (error || !client) {
    return <ErrorState message={error || 'Cliente não encontrado.'} />;
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Editar cliente</h1>
        <p className="text-sm text-gray-500 mt-0.5">Atualize as informações de {client.name}.</p>
      </div>
      <Card>
        <ClientForm
          initialValues={client}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/clients/${id}`)}
          submitLabel="Salvar alterações"
        />
      </Card>
    </div>
  );
}
