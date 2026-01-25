import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Building2,
  Users,
  UserPlus,
  Mail,
  Phone,
  Loader2,
  Plus,
  ChevronRight,
  Settings,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { orgApi, authApi } from '../lib/api';
import { useWorkspace } from '../hooks/useWorkspace';
import CreateOrganizationModal from '../components/CreateOrganizationModal';

interface Employee {
  id: number;
  email: string;
  phone?: string;
  full_name: string;
  role: string;
  status: string;
}

interface SearchedUser {
  id: string;
  email?: string;
  phone?: string;
}

const roleOptions = [
  { value: 'owner', label: 'Владелец' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'accountant', label: 'Бухгалтер' },
  { value: 'legal', label: 'Юрист' },
];

const MyOrganizationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedOrg, organizations, hasOrganization, orgRole, switchToOrg, refreshUser } = useWorkspace();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [inviteRole, setInviteRole] = useState('manager');
  const [inviteFullName, setInviteFullName] = useState('');

  // If user has organizations but none selected, select first one
  useEffect(() => {
    if (hasOrganization && !selectedOrg && organizations.length > 0) {
      switchToOrg(organizations[0].organization_id);
    }
  }, [hasOrganization, selectedOrg, organizations, switchToOrg]);

  // Show create org prompt if no organization
  if (!hasOrganization) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-brand-aquamarine/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 size={40} className="text-brand-black" />
            </div>
            <h1 className="text-3xl font-black text-brand-black mb-4">
              У вас пока нет организации
            </h1>
            <p className="text-brand-black/50 mb-8">
              Создайте организацию, чтобы начать работу с документами, добавить сотрудников и контрагентов.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-black text-brand-eggshell px-8 py-4 rounded-xl font-bold hover:brightness-125 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Создать организацию
            </button>
          </div>
        </div>
        <CreateOrganizationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async (org) => {
            // After successful creation, refresh user data and switch to the new org
            await refreshUser();
            if (org?.id) {
              switchToOrg(org.id);
            }
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
          }}
        />
      </div>
    );
  }

  const orgId = selectedOrg?.organization_id;

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await orgApi.listEmployees(orgId);
      return response.data || [];
    },
    enabled: !!orgId,
  });

  const { data: searchResults = [], isLoading: searchingUsers } = useQuery({
    queryKey: ['users-search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 3) return [];
      const response = await authApi.searchUsers(searchQuery);
      return response.data || [];
    },
    enabled: searchQuery.length >= 3,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: any) => orgApi.inviteEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', orgId] });
      setShowInviteModal(false);
      setSelectedUser(null);
      setSearchQuery('');
      setInviteFullName('');
    },
  });

  const handleInvite = () => {
    if (!selectedUser || !orgId) return;
    inviteMutation.mutate({
      organization_id: orgId,
      user_id: selectedUser.id,
      email: selectedUser.email || '',
      full_name: inviteFullName || selectedUser.email || selectedUser.phone || '',
      role: inviteRole,
    });
  };

  const canManageTeam = orgRole === 'owner';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand-black">
            {selectedOrg?.organization_name || 'Моя организация'}
          </h1>
          <p className="text-brand-black/50">
            Ваша роль: <span className="font-bold capitalize">{orgRole}</span>
          </p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-brand-black text-brand-eggshell px-6 py-3 rounded-xl font-bold hover:brightness-125 transition-all inline-flex items-center gap-2"
          >
            <UserPlus size={20} />
            Добавить сотрудника
          </button>
        )}
      </div>

      {/* Organization Info Card */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-brand-aquamarine/20 rounded-2xl flex items-center justify-center">
            <Building2 size={32} className="text-brand-black" />
          </div>
          <div>
            <h2 className="text-xl font-black text-brand-black">
              {selectedOrg?.organization_name}
            </h2>
            <p className="text-brand-black/50">ID: {orgId}</p>
          </div>
        </div>
        {canManageTeam && (
          <button
            onClick={() => navigate({ to: '/dashboard/organizations' })}
            className="text-brand-black/60 hover:text-brand-black font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Settings size={16} />
            Настройки организации
          </button>
        )}
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-brand-black flex items-center gap-2">
            <Users size={24} />
            Команда
          </h3>
          <span className="text-brand-black/40 font-medium">
            {employees.length} сотрудников
          </span>
        </div>

        {loadingEmployees ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-black/20" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-brand-black/40">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p>Пока нет сотрудников</p>
            {canManageTeam && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-4 text-brand-gold font-bold hover:underline"
              >
                Добавить первого сотрудника
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((emp: Employee) => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-4 bg-brand-eggshell/50 rounded-xl hover:bg-brand-eggshell transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-aquamarine/20 rounded-full flex items-center justify-center">
                    <span className="font-bold text-brand-black">
                      {emp.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-brand-black">{emp.full_name}</p>
                    <div className="flex items-center gap-3 text-sm text-brand-black/50">
                      {emp.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {emp.email}
                        </span>
                      )}
                      {emp.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {emp.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {emp.status === 'active' ? 'Активен' : 'Приглашён'}
                  </span>
                  <span className="px-3 py-1 bg-brand-black/5 rounded-full text-xs font-bold text-brand-black capitalize">
                    {emp.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-brand-black">Добавить сотрудника</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-brand-black/40 hover:text-brand-black"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search Users */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-2 block">
                  Поиск пользователя (email или телефон)
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUser(null);
                  }}
                  placeholder="name@example.com или +7..."
                  className="w-full p-3 border border-brand-black/10 rounded-xl focus:border-brand-aquamarine focus:outline-none"
                />

                {/* Search Results */}
                {searchQuery.length >= 3 && (
                  <div className="mt-2 border border-brand-black/10 rounded-xl overflow-hidden">
                    {searchingUsers ? (
                      <div className="p-4 text-center text-brand-black/40">
                        <Loader2 className="animate-spin mx-auto" size={20} />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-brand-black/40">
                        Пользователи не найдены
                      </div>
                    ) : (
                      searchResults.map((user: SearchedUser) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={`w-full p-3 text-left hover:bg-brand-eggshell transition-colors flex items-center justify-between ${selectedUser?.id === user.id ? 'bg-brand-aquamarine/10' : ''
                            }`}
                        >
                          <span className="font-medium text-brand-black">
                            {user.email || user.phone}
                          </span>
                          {selectedUser?.id === user.id && (
                            <CheckCircle size={16} className="text-brand-aquamarine" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-2 block">
                  ФИО сотрудника
                </label>
                <input
                  type="text"
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full p-3 border border-brand-black/10 rounded-xl focus:border-brand-aquamarine focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-2 block">
                  Роль в организации
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setInviteRole(option.value)}
                      className={`p-3 rounded-xl font-medium transition-all ${inviteRole === option.value
                        ? 'bg-brand-black text-brand-eggshell'
                        : 'bg-brand-eggshell text-brand-black hover:bg-brand-black/5'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleInvite}
                disabled={!selectedUser || inviteMutation.isPending}
                className="w-full bg-brand-black text-brand-eggshell py-4 rounded-xl font-bold hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Добавление...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Добавить в команду
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrganizationPage;

