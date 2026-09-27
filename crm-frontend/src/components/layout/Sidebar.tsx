import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Settings,
  X,
  Zap,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Clientes', to: '/clients', icon: <Users size={18} /> },
  { label: 'Oportunidades', to: '/opportunities', icon: <TrendingUp size={18} /> },
  { label: 'Configurações', to: '/settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Nexora CRM</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.to === '/dashboard'
                ? location.pathname === '/dashboard' || location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100
                  ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-indigo-700">PM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Pedro Matos</p>
            <p className="text-xs text-gray-500 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full animate-slide-in">
            <SidebarContent onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
