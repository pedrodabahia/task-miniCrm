import { useState } from 'react';
import { Save, User, Bell, Shield, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'workspace';

export default function Settings() {
  const toast = useToast();
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Pedro Matos',
    email: 'pedro.matos@nexora.com.br',
    phone: '(11) 99999-0000',
    role: 'Administrador',
  });

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Perfil', icon: <User size={16} /> },
    { key: 'notifications', label: 'Notificações', icon: <Bell size={16} /> },
    { key: 'security', label: 'Segurança', icon: <Shield size={16} /> },
    { key: 'workspace', label: 'Workspace', icon: <Globe size={16} /> },
  ];

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Configurações salvas', 'Suas preferências foram atualizadas.');
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie as preferências da sua conta.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-44 shrink-0">
          <nav className="flex flex-col gap-0.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors
                  ${tab === t.key ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span className={tab === t.key ? 'text-indigo-600' : 'text-gray-400'}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {tab === 'profile' && (
            <Card>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-700">PM</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.role}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome completo"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                  <Input
                    label="Cargo"
                    value={profile.role}
                    onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                  />
                </div>
                <Input
                  label="E-mail"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
                <Input
                  label="Telefone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
                <div className="flex justify-end pt-2">
                  <Button icon={<Save size={14} />} loading={saving} onClick={handleSave}>
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Preferências de notificação</h3>
              <div className="space-y-4">
                {[
                  { label: 'Nova oportunidade criada', desc: 'Receba alertas quando uma oportunidade for adicionada.' },
                  { label: 'Estágio atualizado', desc: 'Notifique quando uma oportunidade avançar no pipeline.' },
                  { label: 'Novo cliente', desc: 'Alertas para novos clientes cadastrados.' },
                  { label: 'Resumo semanal', desc: 'Relatório semanal de performance em e-mail.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button icon={<Save size={14} />} loading={saving} onClick={handleSave}>
                    Salvar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Alterar senha</h3>
              <div className="space-y-4">
                <Input label="Senha atual" type="password" placeholder="••••••••" />
                <Input label="Nova senha" type="password" placeholder="••••••••" />
                <Input label="Confirmar nova senha" type="password" placeholder="••••••••" />
                <div className="flex justify-end pt-2">
                  <Button icon={<Save size={14} />} loading={saving} onClick={handleSave}>
                    Atualizar senha
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {tab === 'workspace' && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Configurações do workspace</h3>
              <div className="space-y-4">
                <Input label="Nome da empresa" defaultValue="Nexora Tecnologia Ltda." />
                <Input label="Domínio" defaultValue="nexora.com.br" />
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium">
                    API conectada em:{' '}
                    <span className="font-mono">
                      {(import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'}
                    </span>
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button icon={<Save size={14} />} loading={saving} onClick={handleSave}>
                    Salvar
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
