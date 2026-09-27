import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';

interface BreadcrumbSegment {
  label: string;
  to?: string;
}

const routeBreadcrumbs: Record<string, BreadcrumbSegment[]> = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/clients': [{ label: 'Clientes' }],
  '/clients/new': [{ label: 'Clientes', to: '/clients' }, { label: 'Novo cliente' }],
  '/opportunities': [{ label: 'Oportunidades' }],
  '/opportunities/new': [
    { label: 'Oportunidades', to: '/opportunities' },
    { label: 'Nova oportunidade' },
  ],
  '/settings': [{ label: 'Configurações' }],
};

function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (routeBreadcrumbs[pathname]) return routeBreadcrumbs[pathname];
  if (/^\/clients\/[^/]+\/edit$/.test(pathname))
    return [{ label: 'Clientes', to: '/clients' }, { label: 'Editar cliente' }];
  if (/^\/clients\/[^/]+$/.test(pathname))
    return [{ label: 'Clientes', to: '/clients' }, { label: 'Detalhes do cliente' }];
  if (/^\/opportunities\/[^/]+\/edit$/.test(pathname))
    return [
      { label: 'Oportunidades', to: '/opportunities' },
      { label: 'Editar oportunidade' },
    ];
  if (/^\/opportunities\/[^/]+$/.test(pathname))
    return [
      { label: 'Oportunidades', to: '/opportunities' },
      { label: 'Detalhes da oportunidade' },
    ];
  return [{ label: 'Nexora CRM' }];
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const breadcrumbs = resolveBreadcrumbs(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-gray-300 text-xs">/</span>}
            {seg.to ? (
              <Link
                to={seg.to}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors truncate"
              >
                {seg.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-gray-900 truncate">{seg.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-48">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-700">PM</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-900 leading-none">Pedro Matos</p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
