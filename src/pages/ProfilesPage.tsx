import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Plus,
  Loader2,
  Building,
  User,
  MapPin,
  CreditCard,
  Search
} from 'lucide-react';
import { orgApi } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../hooks/useWorkspace';

const ProfilesPage = () => {
  const queryClient = useQueryClient();
  const { selectedOrgId } = useWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    organization_id: selectedOrgId || 0,
    name: '',
    legal_address: { full_address: '' },
    actual_address: { full_address: '' },
    bank_details: { bank_name: '', iik: '', bik: '' },
    signatories: [{ full_name: '', position: '', basis: 'Устав', is_default: true }]
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', selectedOrgId],
    queryFn: () => selectedOrgId ? orgApi.listProfiles(selectedOrgId).then(res => res.data) : Promise.resolve([]),
    enabled: !!selectedOrgId
  });

  const createMutation = useMutation({
    mutationFn: orgApi.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', selectedOrgId] });
      setIsCreateOpen(false);
      setNewProfile({
        organization_id: selectedOrgId || 0,
        name: '',
        legal_address: { full_address: '' },
        actual_address: { full_address: '' },
        bank_details: { bank_name: '', iik: '', bik: '' },
        signatories: [{ full_name: '', position: '', basis: 'Устав', is_default: true }]
      });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrgId) {
      createMutation.mutate({ ...newProfile, organization_id: selectedOrgId });
    }
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">Профили организации</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Сохраняйте реквизиты для быстрого заполнения</p>
        </div>
        <button
          onClick={() => {
            if (selectedOrgId) {
              setNewProfile(prev => ({ ...prev, organization_id: selectedOrgId }));
              setIsCreateOpen(true);
            }
          }}
          disabled={!selectedOrgId}
          className="bg-brand-aquamarine text-brand-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Добавить профиль
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>
        ) : profiles?.length > 0 ? (
          profiles.map((profile: any) => (
            <div key={profile.id} className="bg-white rounded-[40px] p-8 border border-brand-black/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-aquamarine/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-brand-aquamarine/10 transition-colors" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-brand-aquamarine/20 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="text-brand-aquamarine" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-brand-black">{profile.name}</h3>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-black/40">Активный профиль</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="text-brand-black/20 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">Юридический адрес</h5>
                    <p className="text-sm font-bold text-brand-black/70">{profile.legal_address?.full_address || '—'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CreditCard className="text-brand-black/20 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">Банковские реквизиты</h5>
                    <p className="text-sm font-bold text-brand-black/70">{profile.bank_details?.bank_name} • {profile.bank_details?.iik}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <User className="text-brand-black/20 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">Подписант</h5>
                    <p className="text-sm font-bold text-brand-black/70">{profile.signatories?.[0]?.full_name} ({profile.signatories?.[0]?.position})</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-brand-black/5 flex justify-between items-center">
                <button className="text-sm font-black text-brand-black/40 hover:text-brand-black transition-colors">Редактировать</button>
                <button className="text-sm font-black text-red-500/40 hover:text-red-500 transition-colors">Удалить</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 bg-brand-eggshell/50 rounded-[40px] border-2 border-dashed border-brand-black/5">
            <ShieldCheck size={48} className="mx-auto text-brand-black/10 mb-4" />
            <p className="text-brand-black/40 font-bold">Профили пока не созданы.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-4xl w-full shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">Новый профиль компании</h2>
              <p className="text-brand-black/40 font-medium mb-8">Создайте профиль, чтобы быстро использовать реквизиты в договорах.</p>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Общие данные</h4>
                      <input
                        type="text"
                        placeholder="Название профиля (например, Главный офис)"
                        value={newProfile.name}
                        onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Адреса</h4>
                      <input
                        type="text"
                        placeholder="Юридический адрес"
                        value={newProfile.legal_address.full_address}
                        onChange={e => setNewProfile({ ...newProfile, legal_address: { full_address: e.target.value } })}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Фактический адрес"
                        value={newProfile.actual_address.full_address}
                        onChange={e => setNewProfile({ ...newProfile, actual_address: { full_address: e.target.value } })}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Банковские реквизиты</h4>
                      <input
                        type="text"
                        placeholder="Название банка"
                        value={newProfile.bank_details.bank_name}
                        onChange={e => setNewProfile({ ...newProfile, bank_details: { ...newProfile.bank_details, bank_name: e.target.value } })}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="ИИК (IBAN)"
                          value={newProfile.bank_details.iik}
                          onChange={e => setNewProfile({ ...newProfile, bank_details: { ...newProfile.bank_details, iik: e.target.value } })}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="БИК"
                          value={newProfile.bank_details.bik}
                          onChange={e => setNewProfile({ ...newProfile, bank_details: { ...newProfile.bank_details, bik: e.target.value } })}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Подписант по умолчанию</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="ФИО"
                          value={newProfile.signatories[0].full_name}
                          onChange={e => {
                            const sigs = [...newProfile.signatories];
                            sigs[0].full_name = e.target.value;
                            setNewProfile({ ...newProfile, signatories: sigs });
                          }}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Должность"
                          value={newProfile.signatories[0].position}
                          onChange={e => {
                            const sigs = [...newProfile.signatories];
                            sigs[0].position = e.target.value;
                            setNewProfile({ ...newProfile, signatories: sigs });
                          }}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin" /> : 'Создать профиль'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilesPage;
