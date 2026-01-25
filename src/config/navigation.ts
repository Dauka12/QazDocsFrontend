import {
  FileText,
  Users,
  Building2,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  Scale,
  FileSpreadsheet,
  History,
  UserPlus,
  PlusCircle
} from 'lucide-react';

export type NavItemKey =
  // Personal space items
  | 'MyDocs'
  | 'OurProfiles'
  | 'Requests'
  | 'LawyerProfile'
  | 'OrganizationEntry'
  // Organization items
  | 'Dashboard'
  | 'Documents'
  | 'DocumentsFinancial'
  | 'DocumentsAssigned'
  | 'Counterparties'
  | 'CounterpartiesReadonly'
  | 'Profiles'
  | 'Team'
  | 'TeamReadonly'
  | 'OrgSettings'
  | 'AuditLog'
  | 'Registry'
  | 'DashboardReviewQueue';

export interface NavItem {
  key: NavItemKey;
  label: string;
  labelRu: string;
  icon: typeof FileText;
  path: string;
  badge?: boolean; // For showing notification count
  readonly?: boolean;
}

// All navigation items definition
export const NAV_ITEMS: Record<NavItemKey, NavItem> = {
  MyDocs: {
    key: 'MyDocs',
    label: 'My Documents',
    labelRu: 'Мои документы',
    icon: FileText,
    path: '/dashboard/documents',
  },
  OurProfiles: {
    key: 'OurProfiles',
    label: 'Our Profiles',
    labelRu: 'Наши профили',
    icon: ShieldCheck,
    path: '/dashboard/profiles',
  },
  Requests: {
    key: 'Requests',
    label: 'Review Requests',
    labelRu: 'Заявки',
    icon: ClipboardList,
    path: '/dashboard/lawyer-requests',
    badge: true,
  },
  LawyerProfile: {
    key: 'LawyerProfile',
    label: 'Lawyer Profile',
    labelRu: 'Профиль юриста',
    icon: Scale,
    path: '/dashboard/lawyer-profile',
  },
  OrganizationEntry: {
    key: 'OrganizationEntry',
    label: 'Organizations',
    labelRu: 'Организации',
    icon: Building2,
    path: '/dashboard/organizations',
  },
  Dashboard: {
    key: 'Dashboard',
    label: 'Dashboard',
    labelRu: 'Дашборд',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  DashboardReviewQueue: {
    key: 'DashboardReviewQueue',
    label: 'Review Queue',
    labelRu: 'Очередь проверки',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  Documents: {
    key: 'Documents',
    label: 'Documents',
    labelRu: 'Документы',
    icon: FileText,
    path: '/dashboard/documents',
  },
  DocumentsFinancial: {
    key: 'DocumentsFinancial',
    label: 'Financial Docs',
    labelRu: 'Счета/Акты',
    icon: FileSpreadsheet,
    path: '/dashboard/documents?type=financial',
  },
  DocumentsAssigned: {
    key: 'DocumentsAssigned',
    label: 'Assigned Documents',
    labelRu: 'Назначенные',
    icon: FileText,
    path: '/dashboard/documents?filter=assigned',
  },
  Counterparties: {
    key: 'Counterparties',
    label: 'Counterparties',
    labelRu: 'Контрагенты',
    icon: UserCheck,
    path: '/dashboard/counterparties',
  },
  CounterpartiesReadonly: {
    key: 'CounterpartiesReadonly',
    label: 'Counterparties',
    labelRu: 'Контрагенты',
    icon: UserCheck,
    path: '/dashboard/counterparties',
    readonly: true,
  },
  Profiles: {
    key: 'Profiles',
    label: 'Profiles',
    labelRu: 'Реквизиты',
    icon: ShieldCheck,
    path: '/dashboard/profiles',
  },
  Team: {
    key: 'Team',
    label: 'Team',
    labelRu: 'Команда',
    icon: Users,
    path: '/dashboard/employees',
  },
  TeamReadonly: {
    key: 'TeamReadonly',
    label: 'Team',
    labelRu: 'Команда',
    icon: Users,
    path: '/dashboard/employees',
    readonly: true,
  },
  OrgSettings: {
    key: 'OrgSettings',
    label: 'Settings',
    labelRu: 'Настройки',
    icon: Settings,
    path: '/dashboard/org-settings',
  },
  AuditLog: {
    key: 'AuditLog',
    label: 'Audit Log',
    labelRu: 'Журнал действий',
    icon: History,
    path: '/dashboard/audit-log',
  },
  Registry: {
    key: 'Registry',
    label: 'Registry',
    labelRu: 'Реестр',
    icon: FileSpreadsheet,
    path: '/dashboard/registry',
  },
};

// Navigation config per workspace and role
export const NAV_CONFIG = {
  personal: {
    user: ['MyDocs', 'OurProfiles', 'OrganizationEntry'] as NavItemKey[],
    free_lawyer: ['MyDocs', 'Requests', 'LawyerProfile', 'OrganizationEntry'] as NavItemKey[],
    admin: ['MyDocs', 'OurProfiles', 'OrganizationEntry'] as NavItemKey[],
    external_counterparty: ['MyDocs'] as NavItemKey[],
  },
  organization: {
    owner: ['Dashboard', 'Documents', 'Counterparties', 'Profiles', 'Team', 'OrgSettings', 'AuditLog'] as NavItemKey[],
    manager: ['Dashboard', 'Documents', 'Counterparties', 'Profiles', 'TeamReadonly'] as NavItemKey[],
    accountant: ['Dashboard', 'DocumentsFinancial', 'Counterparties', 'Profiles', 'Registry'] as NavItemKey[],
    legal: ['DashboardReviewQueue', 'DocumentsAssigned', 'CounterpartiesReadonly'] as NavItemKey[],
  },
};

export function getNavItems(workspace: 'personal' | 'organization', role: string): NavItem[] {
  const config = workspace === 'personal'
    ? NAV_CONFIG.personal
    : NAV_CONFIG.organization;

  const keys = (config as Record<string, NavItemKey[]>)[role] || [];
  return keys.map(key => NAV_ITEMS[key]).filter(Boolean);
}
