import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authApi } from '../lib/api';

export type AccountRole = 'user' | 'free_lawyer' | 'admin' | 'external_counterparty';
export type OrgRole = 'owner' | 'manager' | 'accountant' | 'legal';

export interface OrgMembership {
  organization_id: number;
  organization_name: string;
  role: OrgRole;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role_name: AccountRole;
  organizations?: OrgMembership[];
}

export type WorkspaceType = 'personal' | 'organization';

interface WorkspaceContextValue {
  user: User | null;
  loading: boolean;
  workspace: WorkspaceType;
  selectedOrgId: number | null;
  selectedOrg: OrgMembership | null;
  accountRole: AccountRole;
  orgRole: OrgRole | null;
  organizations: OrgMembership[];
  isFreeLawyer: boolean;
  hasOrganization: boolean;
  switchToOrg: (orgId: number) => void;
  switchToPersonal: () => void;
  refreshUser: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceType>('personal');
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await authApi.getMe();
      setUser(response.data);

      // Check if there's a saved org selection
      const savedOrgId = localStorage.getItem('selectedOrgId');
      if (savedOrgId && response.data.organizations?.some((o: OrgMembership) => o.organization_id == parseInt(savedOrgId))) {
        setSelectedOrgId(parseInt(savedOrgId));
        setWorkspace('organization');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const organizations = user?.organizations || [];
  const selectedOrg = organizations.find(o => o.organization_id === selectedOrgId) || null;
  const accountRole = user?.role_name || 'user';
  const orgRole = selectedOrg?.role || null;
  const isFreeLawyer = accountRole === 'free_lawyer';
  const hasOrganization = organizations.length > 0;

  const switchToOrg = (orgId: number) => {
    const org = organizations.find(o => o.organization_id === orgId);
    if (org) {
      setSelectedOrgId(orgId);
      setWorkspace('organization');
      localStorage.setItem('selectedOrgId', orgId.toString());
    }
  };

  const switchToPersonal = () => {
    setSelectedOrgId(null);
    setWorkspace('personal');
    localStorage.removeItem('selectedOrgId');
  };

  const value: WorkspaceContextValue = {
    user,
    loading,
    workspace,
    selectedOrgId,
    selectedOrg,
    accountRole,
    orgRole,
    organizations,
    isFreeLawyer,
    hasOrganization,
    switchToOrg,
    switchToPersonal,
    refreshUser: fetchUser,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export default useWorkspace;
