import React from 'react';
import { 
  Building2, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link, useLocation } from '@tanstack/react-router';

interface SidebarProps {
  activeTab?: 'organizations' | 'documents' | 'employees';
  setActiveTab?: (tab: 'organizations' | 'documents') => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate({ to: '/login' });
  };

  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-white border-r border-brand-black/5 flex flex-col p-6 space-y-8">
      <Link to="/dashboard" className="flex items-center gap-2 px-4">
        <div className="w-8 h-8 bg-brand-aquamarine flex items-center justify-center rounded-lg">
          <span className="text-brand-black font-black text-xl">Q</span>
        </div>
        <span className="text-xl font-black tracking-tight text-brand-black">QazDocs</span>
      </Link>

      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => navigate({ to: '/dashboard/organizations' })}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${(currentPath === '/dashboard/organizations' || currentPath === '/dashboard') ? 'bg-brand-black text-brand-eggshell shadow-lg' : 'text-brand-black/40 hover:bg-brand-black/5 hover:text-brand-black'}`}
        >
          <Building2 size={20} />
          Organizations
        </button>
        <button 
          onClick={() => navigate({ to: '/dashboard/documents' })}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentPath === '/dashboard/documents' ? 'bg-brand-black text-brand-eggshell shadow-lg' : 'text-brand-black/40 hover:bg-brand-black/5 hover:text-brand-black'}`}
        >
          <FileText size={20} />
          Documents
        </button>
        <button 
          onClick={() => navigate({ to: '/dashboard/employees' })}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentPath === '/dashboard/employees' ? 'bg-brand-black text-brand-eggshell shadow-lg' : 'text-brand-black/40 hover:bg-brand-black/5 hover:text-brand-black'}`}
        >
          <Users size={20} />
          Employees
        </button>
      </nav>

      <div className="pt-8 border-t border-brand-black/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-brand-black/40 hover:bg-brand-black/5 hover:text-brand-black transition-all">
          <Settings size={20} />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
