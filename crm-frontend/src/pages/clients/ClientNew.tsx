import { useNavigate } from 'react-router-dom';
import { useClientsRepository } from '@/lib/di/ServicesContext';
import { mapApiError } from '@/lib/format';
import type { CreateClientBody } from '@/lib/repositories/IClientsRepository';
import { ClientForm } from '@/components/forms/ClientForm';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function ClientNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const clientsRepository = useClientsRepository();

  async function handleSubmit(data: CreateClientBody) {
    try {
      const client = await clientsRepository.create(data);
      toast.success('Cliente criado', `${client.name} foi cadastrado com sucesso.`);
      navigate(`/clients/${client.id}`);
    } catch (err: any) {
      toast.error('Erro ao criar cliente', mapApiError(err.statusCode));
      throw err;
    }
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Novo cliente</h1>
        <p className="text-sm text-gray-500 mt-0.5">Preencha os dados para cadastrar um novo cliente.</p>
      </div>
      <Card>
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/clients')}
          submitLabel="Criar cliente"
        />
      </Card>
    </div>
  );
}
