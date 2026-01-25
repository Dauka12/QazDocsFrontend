import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  User,
  Plus,
  Key,
  Check
} from 'lucide-react';
import { useWorkspace, OrgMembership } from '../hooks/useWorkspace';
import { useNavigate } from '@tanstack/react-router';

const WorkspaceSwitcher = () => {
  const {
    workspace,
    selectedOrg,
    organizations,
    switchToOrg,
    switchToPersonal,
    hasOrganization
  } = useWorkspace();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleOrgSelect = (org: OrgMembership) => {
    switchToOrg(org.organization_id);
    setIsOpen(false);
  };

  const handlePersonalSelect = () => {
    switchToPersonal();
    setIsOpen(false);
  };

  const handleCreateOrg = () => {
    setIsOpen(false);
    navigate({ to: '/dashboard/organizations' });
  };

  const currentLabel = workspace === 'personal'
    ? 'Personal Space'
    : selectedOrg?.organization_name || 'Select Organization';

  const currentIcon = workspace === 'personal' ? User : Building2;
  const CurrentIcon = currentIcon;

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-brand-eggshell/50 hover:bg-brand-eggshell rounded-xl border border-brand-black/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-aquamarine/20 rounded-lg flex items-center justify-center">
            <CurrentIcon size={16} className="text-brand-black" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40">
              {workspace === 'personal' ? 'Personal' : 'Organization'}
            </p>
            <p className="text-sm font-bold text-brand-black truncate max-w-[140px]">
              {currentLabel}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-brand-black/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-brand-black/10 overflow-hidden z-50">
          {/* Personal Space Option */}
          <button
            onClick={handlePersonalSelect}
            className={`w-full flex items-center gap-3 p-3 hover:bg-brand-eggshell/50 transition-colors ${workspace === 'personal' ? 'bg-brand-aquamarine/10' : ''
              }`}
          >
            <User size={16} className="text-brand-black/60" />
            <span className="flex-1 text-left text-sm font-medium text-brand-black">
              Personal Space
            </span>
            {workspace === 'personal' && (
              <Check size={16} className="text-brand-aquamarine" />
            )}
          </button>

          {/* Divider */}
          {(hasOrganization || true) && (
            <div className="border-t border-brand-black/5 my-1" />
          )}

          {/* Organizations List */}
          {organizations.map((org) => (
            <button
              key={org.organization_id}
              onClick={() => handleOrgSelect(org)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-brand-eggshell/50 transition-colors ${selectedOrg?.organization_id === org.organization_id ? 'bg-brand-aquamarine/10' : ''
                }`}
            >
              <Building2 size={16} className="text-brand-black/60" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-brand-black truncate">
                  {org.organization_name}
                </p>
                <p className="text-xs text-brand-black/40 capitalize">
                  {org.role}
                </p>
              </div>
              {selectedOrg?.organization_id === org.organization_id && (
                <Check size={16} className="text-brand-aquamarine" />
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-brand-black/5 my-1" />

          {/* Create Organization */}
          <button
            onClick={handleCreateOrg}
            className="w-full flex items-center gap-3 p-3 hover:bg-brand-eggshell/50 transition-colors text-brand-gold"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Создать организацию</span>
          </button>

          {/* Enter Invite */}
          <button
            onClick={() => { setIsOpen(false); /* TODO: Show invite modal */ }}
            className="w-full flex items-center gap-3 p-3 hover:bg-brand-eggshell/50 transition-colors text-brand-black/60"
          >
            <Key size={16} />
            <span className="text-sm font-medium">Ввести инвайт</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
