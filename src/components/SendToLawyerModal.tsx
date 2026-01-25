import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Scale,
  XCircle,
  Search,
  Loader2,
  CheckCircle,
  Send,
  User
} from 'lucide-react';
import { authApi, lawyerReviewApi } from '../lib/api';

interface Lawyer {
  id: string;
  email?: string;
  phone?: string;
}

interface SendToLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  documentTitle: string;
  organizationId?: number;
}

const SendToLawyerModal = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  organizationId
}: SendToLawyerModalProps) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Search for lawyers
  const { data: lawyers = [], isLoading: searchingLawyers } = useQuery({
    queryKey: ['lawyers-search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await lawyerReviewApi.searchLawyers(searchQuery);
      return response.data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // Send request mutation
  const sendMutation = useMutation({
    mutationFn: (data: any) => lawyerReviewApi.create(data),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedLawyer(null);
        setMessage('');
        setSearchQuery('');
      }, 2000);
    },
  });

  const handleSend = () => {
    if (!selectedLawyer) return;
    sendMutation.mutate({
      document_id: documentId,
      lawyer_user_id: selectedLawyer.id,
      message,
      organization_id: organizationId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-aquamarine/20 rounded-xl flex items-center justify-center">
              <Scale size={20} className="text-brand-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-black">Отправить юристу</h3>
              <p className="text-sm text-brand-black/50 truncate max-w-[300px]">{documentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-black/40 hover:text-brand-black transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h4 className="text-xl font-black text-brand-black mb-2">Заявка отправлена!</h4>
            <p className="text-brand-black/50">Юрист получит уведомление о вашем запросе</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Lawyer */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-2 block">
                Найти юриста (email или телефон)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/30" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedLawyer(null);
                  }}
                  placeholder="Введите email или телефон юриста..."
                  className="w-full pl-10 p-3 border border-brand-black/10 rounded-xl focus:border-brand-aquamarine focus:outline-none"
                />
              </div>

              {/* Search Results */}
              {searchQuery.length >= 2 && (
                <div className="mt-2 border border-brand-black/10 rounded-xl overflow-hidden">
                  {searchingLawyers ? (
                    <div className="p-4 text-center text-brand-black/40">
                      <Loader2 className="animate-spin mx-auto" size={20} />
                    </div>
                  ) : lawyers.length === 0 ? (
                    <div className="p-4 text-center text-brand-black/40">
                      <Scale size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Юристы не найдены</p>
                      <p className="text-xs mt-1">Убедитесь, что юрист зарегистрирован как "Свободный юрист"</p>
                    </div>
                  ) : (
                    lawyers.map((lawyer: Lawyer) => (
                      <button
                        key={lawyer.id}
                        onClick={() => setSelectedLawyer(lawyer)}
                        className={`w-full p-3 text-left hover:bg-brand-eggshell transition-colors flex items-center justify-between ${selectedLawyer?.id === lawyer.id ? 'bg-brand-aquamarine/10' : ''
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-aquamarine/20 rounded-full flex items-center justify-center">
                            <User size={14} className="text-brand-black" />
                          </div>
                          <span className="font-medium text-brand-black">
                            {lawyer.email || lawyer.phone}
                          </span>
                        </div>
                        {selectedLawyer?.id === lawyer.id && (
                          <CheckCircle size={16} className="text-brand-aquamarine" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Lawyer Display */}
            {selectedLawyer && (
              <div className="bg-brand-aquamarine/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-aquamarine/30 rounded-full flex items-center justify-center">
                  <Scale size={18} className="text-brand-black" />
                </div>
                <div>
                  <p className="font-bold text-brand-black">Выбранный юрист</p>
                  <p className="text-sm text-brand-black/60">
                    {selectedLawyer.email || selectedLawyer.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-2 block">
                Сообщение (необязательно)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите, что нужно проверить..."
                rows={3}
                className="w-full p-3 border border-brand-black/10 rounded-xl focus:border-brand-aquamarine focus:outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSend}
              disabled={!selectedLawyer || sendMutation.isPending}
              className="w-full bg-brand-black text-brand-eggshell py-4 rounded-xl font-bold hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Отправка...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Отправить на проверку
                </>
              )}
            </button>

            {sendMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                Ошибка при отправке. Попробуйте ещё раз.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SendToLawyerModal;
