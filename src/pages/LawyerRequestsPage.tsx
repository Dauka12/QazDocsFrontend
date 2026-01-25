import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Building2,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { docApi, lawyerReviewApi } from '../lib/api';
import { useWorkspace } from '../hooks/useWorkspace';

interface LegalRequest {
  id: number;
  requester_type: 'user' | 'organization';
  requester_user_id: string;
  requester_organization_id?: number;
  document_id: number;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
  message?: string;
  verdict?: string;
  lawyer_comments?: string;
  legality_confirmed?: boolean;
  created_at: string;
  requester_name?: string;
  organization_name?: string;
  document_title?: string;
}

const statusConfig = {
  NEW: { label: 'Новая', color: 'bg-blue-100 text-blue-700', icon: Clock },
  IN_PROGRESS: { label: 'В работе', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  COMPLETED: { label: 'Завершена', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DECLINED: { label: 'Отклонена', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const LawyerRequestsPage = () => {
  const { isFreeLawyer, user } = useWorkspace();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<LegalRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'completed'>('inbox');
  const [verdict, setVerdict] = useState('');
  const [comments, setComments] = useState('');
  const [legalityConfirmed, setLegalityConfirmed] = useState(true);

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['lawyer-requests', activeTab],
    queryFn: async () => {
      const response = await lawyerReviewApi.inbox(activeTab === 'inbox' ? 'NEW,IN_PROGRESS' : 'COMPLETED,DECLINED');
      return response.data || [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => lawyerReviewApi.accept(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-requests'], exact: false });
      setSelectedRequest((prev) => (prev && prev.id == id ? { ...prev, status: 'IN_PROGRESS' } : prev));
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => lawyerReviewApi.complete(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-requests'], exact: false });
      setSelectedRequest((prev) => (
        prev && prev.id == variables.id
          ? { ...prev, status: 'COMPLETED', verdict: variables.data.verdict, lawyer_comments: variables.data.comments, legality_confirmed: variables.data.legality_confirmed }
          : prev
      ));
      setVerdict('');
      setComments('');
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => lawyerReviewApi.decline(id, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-requests'], exact: false });
      setSelectedRequest((prev) => (prev && prev.id == variables.id ? { ...prev, status: 'DECLINED', lawyer_comments: variables.reason } : prev));
    },
  });

  if (!isFreeLawyer) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="text-yellow-600" size={24} />
          <div>
            <h3 className="font-bold text-yellow-800">Доступ ограничен</h3>
            <p className="text-yellow-700">Эта страница доступна только для свободных юристов.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAccept = (id: number) => {
    acceptMutation.mutate(id);
  };

  const handleComplete = () => {
    if (!selectedRequest) return;
    completeMutation.mutate({
      id: selectedRequest.id,
      data: {
        verdict,
        comments,
        legality_confirmed: legalityConfirmed,
      },
    });
  };

  const handleDecline = (id: number, reason: string) => {
    declineMutation.mutate({ id, reason });
  };

  const toFileName = (title: string | undefined, docId: number) => {
    if (!title) return `document_${docId}.pdf`;
    const sanitized = title.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').trim();
    return `${sanitized || `document_${docId}`}.pdf`;
  };

  const handleDownload = async (docId: number, title?: string) => {
    try {
      const res = await docApi.exportPdf(docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', toFileName(title, docId));
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-black">Заявки на проверку</h1>
        <p className="text-brand-black/50">Проверка документов от пользователей и организаций</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'inbox'
              ? 'bg-brand-black text-brand-eggshell'
              : 'bg-white text-brand-black/60 hover:bg-brand-black/5'
            }`}
        >
          Входящие
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'completed'
              ? 'bg-brand-black text-brand-eggshell'
              : 'bg-white text-brand-black/60 hover:bg-brand-black/5'
            }`}
        >
          Завершённые
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 flex justify-center">
              <Loader2 className="animate-spin text-brand-black/20" size={32} />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-brand-black/40">
              {activeTab === 'inbox' ? 'Нет новых заявок' : 'Нет завершённых заявок'}
            </div>
          ) : (
            requests.map((request: LegalRequest) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;

              return (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`w-full bg-white rounded-2xl p-5 text-left transition-all hover:shadow-lg border-2 ${selectedRequest?.id === request.id
                      ? 'border-brand-aquamarine shadow-lg'
                      : 'border-transparent'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {request.requester_type === 'organization' ? (
                          <Building2 size={16} className="text-brand-black/40" />
                        ) : (
                          <User size={16} className="text-brand-black/40" />
                        )}
                        <span className="font-bold text-brand-black">
                          {request.organization_name || request.requester_name || 'Пользователь'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-black/60">
                        <FileText size={14} />
                        <span>{request.document_title || `Документ #${request.document_id}`}</span>
                      </div>
                      {request.message && (
                        <p className="mt-2 text-sm text-brand-black/50 line-clamp-2">
                          {request.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        {status.label}
                      </span>
                      <ChevronRight size={16} className="text-brand-black/20" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Request Detail */}
        {selectedRequest && (
          <div className="bg-white rounded-2xl p-6 h-fit sticky top-8">
            <h3 className="text-xl font-black text-brand-black mb-4">
              Заявка #{selectedRequest.id}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-1">
                  От кого
                </p>
                <p className="font-medium text-brand-black">
                  {selectedRequest.organization_name || selectedRequest.requester_name || 'Пользователь'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-1">
                  Сообщение
                </p>
                <p className="text-brand-black/70">
                  {selectedRequest.message || 'Без сообщения'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-1">
                  Статус
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[selectedRequest.status].color}`}>
                  {statusConfig[selectedRequest.status].label}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-1">
                  Документ
                </p>
                <button
                  onClick={() => handleDownload(selectedRequest.document_id, selectedRequest.document_title)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-eggshell rounded-xl font-bold text-sm text-brand-black hover:bg-brand-black/5 transition-all"
                >
                  <FileText size={16} />
                  Скачать PDF
                </button>
              </div>
            </div>

            {selectedRequest.status === 'NEW' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAccept(selectedRequest.id)}
                  disabled={acceptMutation.isPending}
                  className="flex-1 bg-brand-aquamarine text-brand-black py-3 rounded-xl font-bold hover:brightness-95 transition-all"
                >
                  Принять в работу
                </button>
                <button
                  onClick={() => handleDecline(selectedRequest.id, 'Отклонено юристом')}
                  disabled={declineMutation.isPending}
                  className="px-4 bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition-all"
                >
                  Отклонить
                </button>
              </div>
            )}

            {selectedRequest.status === 'IN_PROGRESS' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">
                    Заключение
                  </label>
                  <textarea
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value)}
                    className="w-full mt-2 p-3 border border-brand-black/10 rounded-xl resize-none focus:border-brand-aquamarine focus:outline-none"
                    rows={3}
                    placeholder="Ваше заключение по документу..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">
                    Комментарии
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full mt-2 p-3 border border-brand-black/10 rounded-xl resize-none focus:border-brand-aquamarine focus:outline-none"
                    rows={2}
                    placeholder="Дополнительные комментарии..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="legalityConfirmed"
                    checked={legalityConfirmed}
                    onChange={(e) => setLegalityConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded accent-brand-aquamarine"
                  />
                  <label htmlFor="legalityConfirmed" className="font-medium text-brand-black">
                    Законность документа подтверждена
                  </label>
                </div>

                <button
                  onClick={handleComplete}
                  disabled={completeMutation.isPending || !verdict}
                  className="w-full bg-brand-black text-brand-eggshell py-3 rounded-xl font-bold hover:brightness-125 transition-all disabled:opacity-50"
                >
                  {completeMutation.isPending ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    'Завершить проверку'
                  )}
                </button>
              </div>
            )}

            {(selectedRequest.status === 'COMPLETED' || selectedRequest.status === 'DECLINED') && (
              <div className="space-y-4">
                {selectedRequest.verdict && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-1">
                      Заключение
                    </p>
                    <p className="text-brand-black/70">{selectedRequest.verdict}</p>
                  </div>
                )}
                {selectedRequest.lawyer_comments && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40 mb-1">
                      Комментарии
                    </p>
                    <p className="text-brand-black/70">{selectedRequest.lawyer_comments}</p>
                  </div>
                )}
                {selectedRequest.legality_confirmed !== undefined && (
                  <div className={`p-3 rounded-xl ${selectedRequest.legality_confirmed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className={`font-bold ${selectedRequest.legality_confirmed ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedRequest.legality_confirmed ? '✓ Законность подтверждена' : '✗ Законность не подтверждена'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerRequestsPage;
