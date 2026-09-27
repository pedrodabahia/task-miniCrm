import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, PowerOff, Plus, Trash2, Mail, Phone, FileText, Calendar } from 'lucide-react';
import {
  useClientsRepository,
  useContactsRepository,
  useOpportunitiesRepository,
} from '@/lib/di/ServicesContext';
import { formatDate, mapApiError } from '@/lib/format';
import { formatCurrency } from '@/lib/format';
import type { Client, Contact, Opportunity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientStatusBadge } from '@/components/ui/StatusBadge';
import { StageBadge } from '@/components/ui/StageBadge';
import { OpportunityStatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ContactForm } from '@/components/forms/ContactForm';
import { useToast } from '@/components/ui/Toast';
import type { CreateContactBody } from '@/lib/repositories/IContactsRepository';

type Tab = 'overview' | 'contacts' | 'opportunities';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const clientsRepository = useClientsRepository();
  const contactsRepository = useContactsRepository();
  const opportunitiesRepository = useOpportunitiesRepository();

  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [oppsLoaded, setOppsLoaded] = useState(false);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadClient() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await clientsRepository.getById(id);
      setClient(c);
    } catch {
      setError('Cliente não encontrado.');
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    if (!id || contactsLoaded) return;
    try {
      const data = await contactsRepository.listByClient(id);
      setContacts(data);
      setContactsLoaded(true);
    } catch {}
  }

  async function loadOpportunities() {
    if (!id || oppsLoaded) return;
    try {
      const res = await opportunitiesRepository.list({ clientId: id, limit: 50 });
      setOpportunities(res.data);
      setOppsLoaded(true);
    } catch {}
  }

  useEffect(() => { loadClient(); }, [id]);
  useEffect(() => {
    if (tab === 'contacts') loadContacts();
    if (tab === 'opportunities') loadOpportunities();
  }, [tab]);

  async function handleCreateContact(data: CreateContactBody) {
    if (!id) return;
    try {
      const c = await contactsRepository.create(id, data);
      setContacts((prev) => [...prev, c]);
      setContactModalOpen(false);
      toast.success('Contato adicionado', `${c.name} foi adicionado.`);
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
      throw err;
    }
  }

  async function handleUpdateContact(data: CreateContactBody) {
    if (!editContact) return;
    try {
      const c = await contactsRepository.update(editContact.id, data);
      setContacts((prev) => prev.map((x) => (x.id === c.id ? c : x)));
      setEditContact(null);
      toast.success('Contato atualizado');
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
      throw err;
    }
  }

  async function handleDeleteContact() {
    if (!deleteContact) return;
    setActionLoading(true);
    try {
      await contactsRepository.delete(deleteContact.id);
      setContacts((prev) => prev.filter((c) => c.id !== deleteContact.id));
      setDeleteContact(null);
      toast.success('Contato removido');
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!client) return;
    setActionLoading(true);
    try {
      const updated = await clientsRepository.deactivate(client.id);
      setClient(updated);
      setDeactivateOpen(false);
      toast.success('Cliente desativado');
    } catch (err: any) {
      toast.error('Erro', mapApiError(err.statusCode));
    } finally {
      setActionLoading(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'contacts', label: 'Contatos' },
    { key: 'opportunities', label: 'Oportunidades' },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Card>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !client) {
    return <ErrorState message={error || 'Cliente não encontrado.'} onRetry={loadClient} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-700">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <ClientStatusBadge status={client.status} />
              <span className="text-xs text-gray-400">desde {formatDate(client.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {client.status === 'ACTIVE' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<PowerOff size={14} />}
              onClick={() => setDeactivateOpen(true)}
            >
              Desativar
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit size={14} />}
            onClick={() => navigate(`/clients/${client.id}/edit`)}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <Card>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoItem icon={<Mail size={14} />} label="E-mail" value={client.email} />
            <InfoItem icon={<Phone size={14} />} label="Telefone" value={client.phone || '—'} />
            <InfoItem icon={<FileText size={14} />} label="Documento" value={client.document} mono />
            <InfoItem
              icon={<Calendar size={14} />}
              label="Última atualização"
              value={formatDate(client.updatedAt)}
            />
          </dl>
        </Card>
      )}

      {tab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{contacts.length} contato(s)</p>
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setContactModalOpen(true)}
            >
              Novo contato
            </Button>
          </div>
          {contacts.length === 0 ? (
            <Card>
              <EmptyState
                title="Nenhum contato"
                description="Adicione contatos associados a este cliente."
                action={
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => setContactModalOpen(true)}>
                    Novo contato
                  </Button>
                }
              />
            </Card>
          ) : (
            <Card padding={false}>
              <div className="divide-y divide-gray-100">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gray-600">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {c.role && (
                        <span className="hidden sm:block text-xs text-gray-500">{c.role}</span>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditContact(c)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteContact(c)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{opportunities.length} oportunidade(s)</p>
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => navigate('/opportunities/new')}
            >
              Nova oportunidade
            </Button>
          </div>
          {opportunities.length === 0 ? (
            <Card>
              <EmptyState
                title="Nenhuma oportunidade"
                description="Este cliente ainda não tem oportunidades cadastradas."
              />
            </Card>
          ) : (
            <Card padding={false}>
              <div className="divide-y divide-gray-100">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => navigate(`/opportunities/${opp.id}`)}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(opp.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StageBadge stage={opp.stage} />
                      <OpportunityStatusBadge status={opp.status} />
                      <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                        {formatCurrency(opp.estimatedValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Novo contato"
        description="Adicione um contato associado a este cliente."
      >
        <ContactForm
          onSubmit={handleCreateContact}
          onCancel={() => setContactModalOpen(false)}
        />
      </Modal>
      <Modal
        open={!!editContact}
        onClose={() => setEditContact(null)}
        title="Editar contato"
      >
        {editContact && (
          <ContactForm
            initialValues={editContact}
            onSubmit={handleUpdateContact}
            onCancel={() => setEditContact(null)}
            submitLabel="Salvar alterações"
          />
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleteContact}
        onClose={() => setDeleteContact(null)}
        onConfirm={handleDeleteContact}
        title="Remover contato"
        description={`Tem certeza que deseja remover "${deleteContact?.name}"?`}
        confirmLabel="Remover"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Desativar cliente"
        description={`Tem certeza que deseja desativar "${client.name}"?`}
        confirmLabel="Desativar"
        loading={actionLoading}
      />
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <dt className="text-xs font-medium uppercase tracking-wide">{label}</dt>
      </div>
      <dd className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
