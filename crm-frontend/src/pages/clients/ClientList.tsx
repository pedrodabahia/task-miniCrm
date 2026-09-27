import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit,
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import { useClientsRepository } from '@/lib/di/ServicesContext';
import { formatDate, mapApiError } from '@/lib/format';
import type { Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { ClientStatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function ClientList() {
  const navigate = useNavigate();
  const toast = useToast();
  const clientsRepository = useClientsRepository();

  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const limit = 10;

  const [deactivateTarget, setDeactivateTarget] = useState<Client | null>(
    null,
  );
  const [activateTarget, setActivateTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await clientsRepository.list({
        page,
        limit,
        status,
        search,
      });

      setClients(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load();
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  async function handleDeactivate() {
    if (!deactivateTarget) return;

    setActionLoading(true);

    try {
      await clientsRepository.deactivate(deactivateTarget.id);

      toast.success(
        'Cliente desativado',
        `${deactivateTarget.name} foi desativado.`,
      );

      setDeactivateTarget(null);
      load();
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate() {
    if (!activateTarget) return;

    setActionLoading(true);

    try {
      await clientsRepository.update(activateTarget.id, {
        status: 'ACTIVE',
      });

      toast.success(
        'Cliente reativado',
        `${activateTarget.name} foi reativado.`,
      );

      setActivateTarget(null);
      load();
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setActionLoading(true);

    try {
      await clientsRepository.delete(deleteTarget.id);

      toast.success(
        'Cliente excluído',
        `${deleteTarget.name} foi removido.`,
      );

      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clientes</h1>

          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0
              ? `${total} clientes cadastrados`
              : 'Gerencie seus clientes'}
          </p>
        </div>

        <Button
          icon={<Plus size={14} />}
          onClick={() => navigate('/clients/new')}
        >
          Novo cliente
        </Button>
      </div>

      <Card padding={false}>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou e-mail..."
              icon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Todos os status' },
                { value: 'ACTIVE', label: 'Ativos' },
                { value: 'INACTIVE', label: 'Inativos' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <Table
              keyExtractor={(c) => c.id}
              data={loading ? [] : clients}
              columns={[
                {
                  key: 'name',
                  header: 'Nome',
                  render: (c) => (
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  ),
                },
                {
                  key: 'phone',
                  header: 'Telefone',
                  render: (c) =>
                    c.phone || (
                      <span className="text-gray-300">—</span>
                    ),
                },
                {
                  key: 'document',
                  header: 'Documento',
                  render: (c) => (
                    <span className="font-mono text-xs">
                      {c.document}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (c) => (
                    <ClientStatusBadge status={c.status} />
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Criação',
                  render: (c) => (
                    <span className="text-gray-500">
                      {formatDate(c.createdAt)}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: '',
                  className: 'w-32',
                  render: (c) => (
                    <div className="flex items-center gap-1">
                      {/* Visualizar */}
                      <button
                        onClick={() =>
                          navigate(`/clients/${c.id}`)
                        }
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() =>
                          navigate(`/clients/${c.id}/edit`)
                        }
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={15} />
                      </button>

                      {/* Ativar / Desativar */}
                      {c.status === 'ACTIVE' ? (
                        <button
                          onClick={() =>
                            setDeactivateTarget(c)
                          }
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Desativar"
                        >
                          <PowerOff size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setActivateTarget(c)
                          }
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Reativar"
                        >
                          <Power size={15} />
                        </button>
                      )}

                      {/* Excluir */}
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
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

            {!loading && clients.length === 0 && (
              <EmptyState
                title="Nenhum cliente encontrado"
                description="Cadastre seu primeiro cliente para começar."
                action={
                  <Button
                    icon={<Plus size={14} />}
                    size="sm"
                    onClick={() => navigate('/clients/new')}
                  >
                    Novo cliente
                  </Button>
                }
              />
            )}

            {!loading && clients.length > 0 && (
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

      {/* Desativar */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Desativar cliente"
        description={`Tem certeza que deseja desativar "${deactivateTarget?.name}"? O cliente não poderá receber novas oportunidades.`}
        confirmLabel="Desativar"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* Reativar */}
      <ConfirmDialog
        open={!!activateTarget}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        title="Reativar cliente"
        description={`Tem certeza que deseja reativar "${activateTarget?.name}"? O cliente poderá receber novas oportunidades novamente.`}
        confirmLabel="Reativar"
        confirmVariant="primary"
        loading={actionLoading}
      />

      {/* Excluir */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Clientes com dados relacionados podem ser apenas desativados.`}
        confirmLabel="Excluir"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}