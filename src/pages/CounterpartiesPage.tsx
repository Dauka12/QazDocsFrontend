import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserCheck, 
  Plus, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Search
} from 'lucide-react';
import { counterpartyApi } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const CounterpartiesPage = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCP, setNewCP] = useState({
    organization_id: 1,
    type: 'LEGAL',
    name: '',
    bin: '',
    email: '',
    phone: '',
    address: { full_address: '' },
    signatory: { full_name: '', position: '', basis: 'Устав' }
  });

  const { data: counterparties, isLoading } = useQuery({
    queryKey: ['counterparties'],
    queryFn: () => counterpartyApi.list(1).then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: counterpartyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counterparties'] });
      setIsCreateOpen(false);
      setNewCP({
        organization_id: 1,
        type: 'LEGAL',
        name: '',
        bin: '',
        email: '',
        phone: '',
        address: { full_address: '' },
        signatory: { full_name: '', position: '', basis: 'Устав' }
      });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCP);
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">Контрагенты</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Управляйте клиентами и партнерами</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-brand-aquamarine text-brand-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={20} />
          Добавить контрагента
        </button>
      </div>

      <div className="mb-8 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={24} />
        <input 
          type="text" 
          placeholder="Поиск контрагентов..."
          className="w-full bg-white border border-brand-black/5 rounded-[24px] py-6 pl-16 pr-8 focus:outline-none focus:ring-4 focus:ring-brand-aquamarine/10 focus:border-brand-aquamarine/50 transition-all font-bold text-lg"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-brand-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-eggshell border-b border-brand-black/5">
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Название / БИН</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Контакты</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Подписант</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Тип</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : counterparties?.length > 0 ? (
              counterparties.map((cp: any) => (
                <tr key={cp.id} className="border-b border-brand-black/5 hover:bg-brand-eggshell/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-black/5 rounded-xl flex items-center justify-center">
                        <Building className="text-brand-black/40" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-black">{cp.name}</span>
                        <span className="text-xs text-brand-black/40 font-bold">{cp.bin}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-brand-black/60">
                        <Mail size={14} /> {cp.email || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-brand-black/60">
                        <Phone size={14} /> {cp.phone || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                      <span className="text-sm font-bold text-brand-black">{cp.signatory?.full_name || '—'}</span>
                      <span className="text-xs text-brand-black/40 font-bold">{cp.signatory?.position}</span>
                      </div>
                    </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-brand-eggshell text-brand-black/60 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {cp.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-brand-eggshell rounded-lg transition-colors text-brand-black/20 hover:text-brand-black">
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-brand-black/40 font-bold">
                  Контрагенты не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-2xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">Новый контрагент</h2>
              <p className="text-brand-black/40 font-medium mb-8">Добавьте юридическое лицо или физическое лицо.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Данные контрагента</h4>
                    <input 
                      type="text" 
                      placeholder="ФИО / Название компании"
                      value={newCP.name}
                      onChange={e => setNewCP({...newCP, name: e.target.value})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="БИН / ИИН"
                      value={newCP.bin}
                      onChange={e => setNewCP({...newCP, bin: e.target.value})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                      required
                    />
                    <select 
                      value={newCP.type}
                      onChange={e => setNewCP({...newCP, type: e.target.value})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                    >
                      <option value="LEGAL">Юридическое лицо</option>
                      <option value="INDIVIDUAL">Физическое лицо</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Контактные данные</h4>
                    <input 
                      type="email" 
                      placeholder="Электронная почта"
                      value={newCP.email}
                      onChange={e => setNewCP({...newCP, email: e.target.value})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Телефон"
                      value={newCP.phone}
                      onChange={e => setNewCP({...newCP, phone: e.target.value})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Адрес"
                      value={newCP.address.full_address}
                      onChange={e => setNewCP({...newCP, address: { full_address: e.target.value }})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Подписант</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="ФИО"
                      value={newCP.signatory.full_name}
                      onChange={e => setNewCP({...newCP, signatory: {...newCP.signatory, full_name: e.target.value}})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Должность"
                      value={newCP.signatory.position}
                      onChange={e => setNewCP({...newCP, signatory: {...newCP.signatory, position: e.target.value}})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Основание"
                      value={newCP.signatory.basis}
                      onChange={e => setNewCP({...newCP, signatory: {...newCP.signatory, basis: e.target.value}})}
                      className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin" /> : 'Сохранить контрагента'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CounterpartiesPage;
