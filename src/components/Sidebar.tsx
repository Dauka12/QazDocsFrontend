import { Settings, LogOut } from 'lucide-react';
import { useNavigate, Link, useLocation } from '@tanstack/react-router';
import { useWorkspace } from '../hooks/useWorkspace';
import { getNavItems, NAV_ITEMS } from '../config/navigation';
import WorkspaceSwitcher from './WorkspaceSwitcher';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    workspace,
    accountRole,
    orgRole,
    loading,
    user
  } = useWorkspace();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedOrgId');
    navigate({ to: '/login' });
  };

  const currentPath = location.pathname;

  // Get navigation items based on workspace and role
  const rawRole = workspace === 'personal' ? accountRole : (orgRole || 'owner');
  const role = rawRole.toLowerCase();
  const navItems = getNavItems(workspace, role);

  if (loading) {
    return (
      <aside className="w-64 bg-white border-r border-brand-black/5 flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-2 px-4">
          <div className="w-8 h-8 bg-brand-aquamarine flex items-center justify-center rounded-lg">
            <span className="text-brand-black font-black text-xl">Q</span>
          </div>
          <span className="text-xl font-black tracking-tight text-brand-black">QazDocs</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-brand-black/20">Loading...</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-brand-black/5 flex flex-col p-6 space-y-4">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 px-4 mb-2">
        <div className="w-8 h-8 bg-brand-aquamarine flex items-center justify-center rounded-lg">
          <span className="text-brand-black font-black text-xl">Q</span>
        </div>
        <span className="text-xl font-black tracking-tight text-brand-black">QazDocs</span>
      </Link>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher />

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path ||
            (item.path.includes('?') && currentPath === item.path.split('?')[0]);

          return (
            <button
              key={item.key}
              onClick={() => navigate({ to: item.path.split('?')[0] as any })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive
                ? 'bg-brand-black text-brand-eggshell shadow-lg'
                : 'text-brand-black/40 hover:bg-brand-black/5 hover:text-brand-black'
                }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left">{item.labelRu}</span>
              {item.badge && (
                <span className="bg-brand-gold text-brand-black text-xs font-black px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
              {item.readonly && (
                <span className="text-xs text-brand-black/30">👁</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-brand-black/5 space-y-2">
        {/* User Info */}
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40">
              {accountRole === 'free_lawyer' ? 'Юрист' : 'Пользователь'}
            </p>
            <p className="text-sm font-medium text-brand-black truncate">
              {user.email || user.phone}
            </p>
          </div>
        )}

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-brand-black/40 hover:bg-brand-black/5 hover:text-brand-black transition-all">
          <Settings size={20} />
          Настройки
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          Выход
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
