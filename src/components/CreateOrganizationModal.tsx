import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { orgApi } from '../lib/api';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (org: any) => void;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [newOrg, setNewOrg] = useState({ name: '', bin: '', type: 'COMPANY' });

  const createOrgMutation = useMutation({
    mutationFn: orgApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setNewOrg({ name: '', bin: '', type: 'COMPANY' });
      if (onSuccess) onSuccess(response.data);
      onClose();
    }
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgMutation.mutate(newOrg);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[40px] p-12 max-w-lg w-full shadow-2xl relative"
          >
            <button
              onClick={onClose}
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
  );
};

export default CreateOrganizationModal;
