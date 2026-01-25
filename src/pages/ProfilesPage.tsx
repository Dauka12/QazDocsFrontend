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

const ProfilesPage = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    organization_id: 1,
    name: '',
    legal_address: { full_address: '' },
    actual_address: { full_address: '' },
    bank_details: { bank_name: '', iik: '', bik: '' },
    signatories: [{ full_name: '', position: '', basis: 'Charter', is_default: true }]
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => orgApi.listProfiles(1).then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: orgApi.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setIsCreateOpen(false);
      setNewProfile({
        organization_id: 1,
        name: '',
        legal_address: { full_address: '' },
        actual_address: { full_address: '' },
        bank_details: { bank_name: '', iik: '', bik: '' },
        signatories: [{ full_name: '', position: '', basis: 'Charter', is_default: true }]
      });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newProfile);
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">Our Profiles</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Save your company details for quick auto-fill</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-brand-aquamarine text-brand-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={20} />
          Add Profile
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
                  <span className="text-xs font-black uppercase tracking-widest text-brand-black/40">Active Profile</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="text-brand-black/20 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">Legal Address</h5>
                    <p className="text-sm font-bold text-brand-black/70">{profile.legal_address?.full_address || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CreditCard className="text-brand-black/20 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">Bank Details</h5>
                    <p className="text-sm font-bold text-brand-black/70">{profile.bank_details?.bank_name} • {profile.bank_details?.iik}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <User className="text-brand-black/20 shrink-0" size={20} />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">Signatory</h5>
                    <p className="text-sm font-bold text-brand-black/70">{profile.signatories?.[0]?.full_name} ({profile.signatories?.[0]?.position})</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-brand-black/5 flex justify-between items-center">
                <button className="text-sm font-black text-brand-black/40 hover:text-brand-black transition-colors">Edit Details</button>
                <button className="text-sm font-black text-red-500/40 hover:text-red-500 transition-colors">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 bg-brand-eggshell/50 rounded-[40px] border-2 border-dashed border-brand-black/5">
            <ShieldCheck size={48} className="mx-auto text-brand-black/10 mb-4" />
            <p className="text-brand-black/40 font-bold">No profiles saved yet.</p>
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

              <h2 className="text-3xl font-black text-brand-black mb-2">New Company Profile</h2>
              <p className="text-brand-black/40 font-medium mb-8">Create a profile to quickly reuse these details in your contracts.</p>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">General</h4>
                      <input 
                        type="text" 
                        placeholder="Profile Name (e.g. Main HQ)"
                        value={newProfile.name}
                        onChange={e => setNewProfile({...newProfile, name: e.target.value})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Addresses</h4>
                      <input 
                        type="text" 
                        placeholder="Legal Address"
                        value={newProfile.legal_address.full_address}
                        onChange={e => setNewProfile({...newProfile, legal_address: { full_address: e.target.value }})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Actual Address"
                        value={newProfile.actual_address.full_address}
                        onChange={e => setNewProfile({...newProfile, actual_address: { full_address: e.target.value }})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Bank Details</h4>
                      <input 
                        type="text" 
                        placeholder="Bank Name"
                        value={newProfile.bank_details.bank_name}
                        onChange={e => setNewProfile({...newProfile, bank_details: {...newProfile.bank_details, bank_name: e.target.value}})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="IIK (IBAN)"
                          value={newProfile.bank_details.iik}
                          onChange={e => setNewProfile({...newProfile, bank_details: {...newProfile.bank_details, iik: e.target.value}})}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="BIK"
                          value={newProfile.bank_details.bik}
                          onChange={e => setNewProfile({...newProfile, bank_details: {...newProfile.bank_details, bik: e.target.value}})}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Default Signatory</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Full Name"
                          value={newProfile.signatories[0].full_name}
                          onChange={e => {
                            const sigs = [...newProfile.signatories];
                            sigs[0].full_name = e.target.value;
                            setNewProfile({...newProfile, signatories: sigs});
                          }}
                          className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Position"
                          value={newProfile.signatories[0].position}
                          onChange={e => {
                            const sigs = [...newProfile.signatories];
                            sigs[0].position = e.target.value;
                            setNewProfile({...newProfile, signatories: sigs});
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
                  {createMutation.isPending ? <Loader2 className="animate-spin" /> : 'Create Profile'}
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
