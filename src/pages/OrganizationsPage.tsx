import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { orgApi, authApi } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

const OrganizationsPage = () => {
  const queryClient = useQueryClient();
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', bin: '', type: 'COMPANY' });
  const [inviteSearch, setInviteSearch] = useState('');
  const debouncedSearch = useDebounce(inviteSearch, 300);

  const { data: orgs, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => orgApi.list().then(res => res.data),
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', selectedOrg?.id],
    queryFn: () => orgApi.listEmployees(selectedOrg.id).then(res => res.data),
    enabled: !!selectedOrg,
  });

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['user-search', debouncedSearch],
    queryFn: () => authApi.searchUsers(debouncedSearch).then(res => res.data),
    enabled: debouncedSearch.length > 2,
  });

  const createOrgMutation = useMutation({
    mutationFn: orgApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsCreateOrgOpen(false);
      setNewOrg({ name: '', bin: '', type: 'COMPANY' });
    }
  });

  const inviteMutation = useMutation({
    mutationFn: orgApi.inviteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', selectedOrg?.id] });
      setIsInviteOpen(false);
      setInviteSearch('');
    }
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgMutation.mutate(newOrg);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ employeeId: inviteSearch, orgId: selectedOrg.id });
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">С возвращением!</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Ваши организации</p>
        </div>
        <button 
          onClick={() => setIsCreateOrgOpen(true)}
          className="bg-brand-black text-brand-eggshell px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
        >
          <Plus size={20} />
          Создать организацию
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingOrgs ? (
          <Loader2 className="animate-spin text-brand-gold" size={40} />
        ) : orgs?.length > 0 ? (
          orgs.map((org: any) => (
            <motion.div 
              key={org.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[32px] border border-brand-black/5 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-brand-eggshell rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-aquamarine transition-colors">
                <Building2 className="text-brand-black/40 group-hover:text-brand-black" size={24} />
              </div>
              <h3 className="text-xl font-black text-brand-black mb-2">{org.name}</h3>
              <div className="flex items-center gap-2 text-brand-black/40 text-sm font-bold uppercase tracking-wider mb-6">
                <span className="px-2 py-0.5 bg-brand-eggshell rounded-md">{org.bin}</span>
                <span>•</span>
                <span>{org.type}</span>
              </div>
              <button className="w-full flex items-center justify-between p-4 bg-brand-eggshell rounded-2xl font-black hover:bg-brand-black hover:text-brand-eggshell transition-all">
                Открыть рабочее пространство <ChevronRight size={18} />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[40px] border-2 border-dashed border-brand-black/5">
            <Building2 size={48} className="mx-auto text-brand-black/10" />
            <p className="text-brand-black/40 font-bold">Организаций нет. Создайте первую!</p>
          </div>
        )}
      </div>

      {/* Create Org Modal */}
      <AnimatePresence>
        {isCreateOrgOpen && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsCreateOrgOpen(false)}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">Новая организация</h2>
              <p className="text-brand-black/40 font-medium mb-8">Зарегистрируйте юридическое лицо.</p>

              <form onSubmit={handleCreateOrg} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Полное название</label>
                  <input 
                    type="text" 
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    placeholder="ТОО QazDocs"
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">БИН</label>
                  <input 
                    type="text" 
                    value={newOrg.bin}
                    onChange={(e) => setNewOrg({ ...newOrg, bin: e.target.value })}
                    placeholder="123456789012"
                    maxLength={12}
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={createOrgMutation.isPending}
                  className="w-full bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {createOrgMutation.isPending ? <Loader2 className="animate-spin" /> : 'Создать организацию'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsInviteOpen(false)}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">Пригласить сотрудников</h2>
              <p className="text-brand-black/40 font-medium mb-8">Пригласите пользователей в организацию.</p>

              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Поиск пользователей</label>
                  <input 
                    type="text" 
                    value={inviteSearch}
                    onChange={(e) => setInviteSearch(e.target.value)}
                    placeholder="Введите email или телефон..."
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Организация</label>
                  <select 
                    value={selectedOrg?.id}
                    onChange={(e) => setSelectedOrg(orgs.find((org: any) => org.id === e.target.value))}
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                    required
                  >
                    <option value="">Выберите организацию</option>
                    {orgs?.map((org: any) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={createOrgMutation.isPending}
                  className="w-full bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {createOrgMutation.isPending ? <Loader2 className="animate-spin" /> : 'Отправить приглашение'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationsPage;
