import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ClipboardList, 
  Loader2,
  CheckCircle,
  XCircle,
  Undo2,
  MessageSquare,
  Calendar,
  User,
  ExternalLink,
  Plus
} from 'lucide-react';
import { assignmentApi } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentsPage = () => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [response, setResponse] = useState('');

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentApi.listMy().then(res => res.data),
  });

  const completeMutation = useMutation({
    mutationFn: ({id, data}: any) => assignmentApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
      setSelectedTask(null);
      setResponse('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({id, data}: any) => assignmentApi.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
      setSelectedTask(null);
    }
  });

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">Задачи и поручения</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Действия, требующие вашего внимания</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>
        ) : assignments?.length > 0 ? (
          assignments.map((task: any) => (
            <div 
              key={task.id} 
              className={`bg-white rounded-[32px] p-6 border-2 transition-all ${task.status === 'PENDING' ? 'border-brand-aquamarine/20 bg-brand-aquamarine/5' : 'border-brand-black/5 opacity-60'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.status === 'PENDING' ? 'bg-brand-aquamarine text-brand-black' : 'bg-brand-black/5 text-brand-black/20'}`}>
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-brand-black">{task.action_required}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${task.status === 'PENDING' ? 'bg-brand-aquamarine/20 text-brand-black/60' : 'bg-brand-black/5 text-brand-black/40'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-brand-black/60 mb-4">{task.message}</p>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-xs font-black text-brand-black/40">
                        <Calendar size={14} /> Срок: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Без срока'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-brand-black/40">
                        <User size={14} /> От: Система
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {task.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className="bg-brand-black text-white px-6 py-3 rounded-xl font-black text-sm hover:brightness-125 transition-all shadow-lg"
                      >
                        Выполнить
                      </button>
                    </>
                  )}
                  <button className="p-3 bg-brand-black/5 text-brand-black/40 rounded-xl hover:bg-brand-black/10 transition-all">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-brand-eggshell/50 rounded-[40px] border-2 border-dashed border-brand-black/5">
            <CheckCircle size={48} className="mx-auto text-brand-black/10 mb-4" />
            <p className="text-brand-black/40 font-bold">Все выполнено! Нет активных задач.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedTask(null)}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">{selectedTask.action_required}</h2>
              <p className="text-brand-black/40 font-medium mb-8">Обработайте поручение и оставьте комментарий.</p>

              <div className="space-y-6">
                <div className="p-4 bg-brand-eggshell/50 rounded-2xl border border-brand-black/5">
                  <p className="text-sm font-bold text-brand-black/60 italic">"{selectedTask.message}"</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Ответ / комментарий</h4>
                  <textarea 
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    placeholder="Опишите, что было сделано..."
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold min-h-[120px]"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => rejectMutation.mutate({id: selectedTask.id, data: {reason: response}})}
                    className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} /> Отклонить
                  </button>
                  <button 
                    onClick={() => completeMutation.mutate({id: selectedTask.id, data: {response: response}})}
                    className="flex-1 bg-brand-aquamarine text-brand-black py-4 rounded-2xl font-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} /> Завершить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentsPage;
