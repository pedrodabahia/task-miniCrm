import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateContactBody } from '@/lib/repositories/IContactsRepository';

interface ContactFormProps {
  initialValues?: Partial<CreateContactBody>;
  onSubmit: (data: CreateContactBody) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ContactForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Salvar contato',
}: ContactFormProps) {
  const [form, setForm] = useState<CreateContactBody>({
    name: initialValues.name || '',
    email: initialValues.email || '',
    phone: initialValues.phone || '',
    position: initialValues.position || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateContactBody, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
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

  function field(key: keyof CreateContactBody) {
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
      <Input label="Nome" required placeholder="João Silva" {...field('name')} />
      <Input
        label="E-mail"
        type="email"
        required
        placeholder="joao@empresa.com"
        {...field('email')}
      />
      <Input label="Telefone" type="tel" placeholder="(11) 99999-0000" {...field('phone')} />
      <Input label="Cargo" placeholder="Diretor Comercial" {...field('position')} />
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
