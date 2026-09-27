import { useEffect, useState } from 'react';
import { useClientsRepository } from '@/lib/di/ServicesContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { Client, OpportunityStage } from '@/types';
import type { CreateOpportunityBody } from '@/lib/repositories/IOpportunitiesRepository';

interface OpportunityFormValues {
  title: string;
  description: string;
  estimatedValue: string;
  clientId: string;
  stage?: OpportunityStage;
}

interface OpportunityFormProps {
  initialValues?: Partial<OpportunityFormValues>;
  onSubmit: (data: CreateOpportunityBody & { stage?: OpportunityStage }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  showStage?: boolean;
}

const stageOptions = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'QUALIFICACAO', label: 'Qualificação' },
  { value: 'PROPOSTA', label: 'Proposta' },
  { value: 'NEGOCIACAO', label: 'Negociação' },
  { value: 'GANHA', label: 'Ganha' },
  { value: 'PERDIDA', label: 'Perdida' },
];

export function OpportunityForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  showStage = false,
}: OpportunityFormProps) {
  const [form, setForm] = useState<OpportunityFormValues>({
    title: initialValues.title || '',
    description: initialValues.description || '',
    estimatedValue: initialValues.estimatedValue || '',
    clientId: initialValues.clientId || '',
    stage: initialValues.stage,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OpportunityFormValues, string>>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const clientsRepository = useClientsRepository();

  useEffect(() => {
    clientsRepository
      .list({ limit: 100, status: 'ACTIVE' })
      .then((res) => setClients(res.data))
      .catch(() => {});
  }, [clientsRepository]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Título é obrigatório';
    if (!form.clientId) e.clientId = 'Cliente é obrigatório';
    const val = parseFloat(form.estimatedValue.replace(',', '.'));
    if (!form.estimatedValue.trim() || isNaN(val) || val < 0)
      e.estimatedValue = 'Informe um valor válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        estimatedValue: parseFloat(form.estimatedValue.replace(',', '.')),
        clientId: form.clientId,
        ...(showStage && form.stage ? { stage: form.stage } : {}),
      });
    } finally {
      setSubmitting(false);
    }
  }

  function textField(key: 'title' | 'description' | 'estimatedValue') {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((err) => ({ ...err, [key]: undefined }));
      },
      error: errors[key],
    };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Título" required placeholder="Proposta de migração cloud" {...textField('title')} />
      <Textarea
        label="Descrição"
        placeholder="Detalhes da oportunidade..."
        {...textField('description')}
        rows={3}
      />
      <Input
        label="Valor estimado (R$)"
        required
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        {...textField('estimatedValue')}
      />
      <Select
        label="Cliente"
        required
        value={form.clientId}
        onChange={(e) => {
          setForm((f) => ({ ...f, clientId: e.target.value }));
          setErrors((err) => ({ ...err, clientId: undefined }));
        }}
        error={errors.clientId}
        placeholder="Selecione um cliente"
        options={clients.map((c) => ({ value: c.id, label: c.name }))}
      />
      {showStage && (
        <Select
          label="Estágio"
          value={form.stage || ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, stage: e.target.value as OpportunityStage }))
          }
          options={stageOptions}
        />
      )}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
