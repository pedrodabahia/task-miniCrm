import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateClientBody } from '@/lib/repositories/IClientsRepository';

interface ClientFormProps {
  initialValues?: Partial<CreateClientBody>;
  onSubmit: (data: CreateClientBody) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ClientForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: ClientFormProps) {
  const [form, setForm] = useState<CreateClientBody>({
    name: initialValues.name || '',
    email: initialValues.email || '',
    phone: initialValues.phone || '',
    document: initialValues.document || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateClientBody, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.document.trim()) e.document = 'Documento é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  function field(key: keyof CreateClientBody) {
    return {
      value: form[key] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((err) => ({ ...err, [key]: undefined }));
      },
      error: errors[key],
    };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" required placeholder="Empresa ABC Ltda." {...field('name')} />
      <Input
        label="E-mail"
        type="email"
        required
        placeholder="contato@empresa.com"
        {...field('email')}
      />
      <Input label="Telefone" type="tel" placeholder="(11) 99999-0000" {...field('phone')} />
      <Input
        label="Documento"
        required
        placeholder="CNPJ ou CPF"
        {...field('document')}
      />
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
