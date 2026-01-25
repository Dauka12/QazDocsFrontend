import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Loader2,
  ChevronRight,
  Building2,
  FileText,
  Settings,
  LogOut,
  Mail
} from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { orgApi } from '../lib/api';
import Sidebar from '../components/Sidebar';
import { useWorkspace } from '../hooks/useWorkspace';

const EmployeesPage = () => {
  const queryClient = useQueryClient();
  const { selectedOrgId } = useWorkspace();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'EMPLOYEE', organization_id: selectedOrgId || 0 });
  const [error, setError] = useState<string | null>(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', selectedOrgId],
    queryFn: () => selectedOrgId ? orgApi.listEmployees(selectedOrgId).then(res => res.data) : Promise.resolve([]),
    enabled: !!selectedOrgId
  });

  const inviteMutation = useMutation({
    mutationFn: orgApi.inviteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', selectedOrgId] });
      setIsInviteOpen(false);
      setInviteData({ email: '', role: 'EMPLOYEE', organization_id: selectedOrgId || 0 });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data || err.message || 'Не удалось пригласить сотрудника');
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrgId) {
      inviteMutation.mutate({ ...inviteData, organization_id: selectedOrgId });
    }
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">Сотрудники</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Управляйте командой</p>
        </div>
        <button
          onClick={() => {
            if (selectedOrgId) {
              setInviteData(prev => ({ ...prev, organization_id: selectedOrgId }));
              setIsInviteOpen(true);
            }
          }}
          disabled={!selectedOrgId}
          className="bg-brand-aquamarine text-brand-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Пригласить сотрудника
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-brand-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-eggshell border-b border-brand-black/5">
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Сотрудник</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Роль</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Статус</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Дата входа</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : employees?.length > 0 ? (
              employees.map((emp: any) => (
                <tr key={emp.id} className="border-b border-brand-black/5 hover:bg-brand-eggshell/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center">
                        <Users className="text-brand-gold" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-black">{emp.user?.email || emp.email}</span>
                        <span className="text-xs text-brand-black/40 font-bold">{emp.user?.first_name} {emp.user?.last_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">{emp.role}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {emp.status || 'Активен'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">{emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-brand-eggshell rounded-lg transition-colors">
                      <ChevronRight size={20} className="text-brand-black/20" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Users size={48} className="mx-auto text-brand-black/10 mb-4" />
                  <p className="text-brand-black/40 font-bold">Сотрудники не найдены.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                onClick={() => {
                  setIsInviteOpen(false);
                  setError(null);
                }}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">Пригласить сотрудника</h2>
              <p className="text-brand-black/40 font-medium mb-8">Отправьте приглашение в организацию.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Электронная почта</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-black/20" size={20} />
                    <input
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      placeholder="employee@company.com"
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Роль</label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-4 px-6 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all font-bold"
                  >
                    <option value="EMPLOYEE">Сотрудник</option>
                    <option value="ADMIN">Администратор</option>
                    <option value="MANAGER">Менеджер</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="w-full bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {inviteMutation.isPending ? <Loader2 className="animate-spin" /> : 'Отправить приглашение'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeesPage;
