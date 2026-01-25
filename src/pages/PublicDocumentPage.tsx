import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { 
  AlertTriangle,
  Loader2,
  ShieldCheck,
  FileText,
  XCircle
} from 'lucide-react';
import { signingApi } from '../lib/api';
import { ncaLayer } from '../services/ncaLayer';

const formatStatus = (status?: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Черновик';
    case 'APPROVED':
      return 'Утвержден';
    case 'SIGNED':
      return 'Подписан';
    default:
      return status || '';
  }
};

const PublicDocumentPage = () => {
  const { publicId } = useParams({ from: '/public/documents/$publicId' });
  const [operation, setOperation] = useState<any>(null);
  const [signError, setSignError] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const token = localStorage.getItem('token');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-doc', publicId],
    queryFn: () => signingApi.publicVerify(publicId).then(res => res.data),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ operationId, signedXml }: { operationId: number; signedXml: string }) => 
      signingApi.verify(operationId, signedXml).then(res => res.data),
    onSuccess: () => {
      setOperation(null);
      refetch();
    },
  });

  const handleSignWithNca = async () => {
    if (!data?.document_id) return;
    setSignError('');
    setIsSigning(true);
    try {
      const op = operation || (await signingApi.init(data.document_id).then(res => res.data));
      setOperation(op);
      const result = await ncaLayer.signXmlSignature(op.xml_to_sign);
      if (!result?.signature) {
        setSignError('Подпись не создана. Проверьте NCALayer и ключ ЭЦП.');
        return;
      }
      await verifyMutation.mutateAsync({ operationId: op.operation_id, signedXml: result.signature });
    } catch (err) {
      console.error('NCA sign error', err);
      setSignError('Не удалось подписать документ через NCALayer.');
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-eggshell/60">
        <Loader2 className="animate-spin text-brand-black/40" size={32} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-eggshell/60">
        <div className="bg-white rounded-[32px] p-10 border border-brand-black/5 text-center">
          <AlertTriangle className="mx-auto text-brand-black/30 mb-4" size={32} />
          <h1 className="text-xl font-black text-brand-black mb-2">Документ не найден</h1>
          <p className="text-sm font-bold text-brand-black/40">Ссылка может быть недействительной или устарела.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-eggshell/60 p-8 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-[40px] border border-brand-black/5 shadow-sm p-8 md:p-12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-brand-black/40 mb-2">
                <ShieldCheck size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Публичная проверка</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-black">Статус подписания документа</h1>
              <p className="text-brand-black/40 font-medium mt-2">Проверка подписей и журнал действий.</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
              data.is_signed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {data.is_signed ? 'Подписано обеими сторонами' : 'Ожидает подписей'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 mt-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">ID документа</div>
                  <div className="text-sm font-black text-brand-black">{data.document_id}</div>
                </div>
                <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">Шаблон</div>
                  <div className="text-sm font-black text-brand-black">{data.template_type}</div>
                </div>
                <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">Статус</div>
                  <div className="text-sm font-black text-brand-black">{formatStatus(data.status)}</div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-[32px] border border-brand-black/5">
                <div className="flex items-center gap-2 mb-4 text-brand-black/40">
                  <FileText size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Подписи</h2>
                </div>
                {Array.isArray(data.signatures) && data.signatures.length > 0 ? (
                  <div className="space-y-3">
                    {data.signatures.map((sig: any) => (
                      <div key={sig.id} className="flex items-center justify-between gap-4 p-3 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                        <div>
                          <div className="text-sm font-black text-brand-black">{sig.signer_name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">ИИН: {sig.signer_iin}</div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">
                          {sig.signed_at ? new Date(sig.signed_at).toLocaleString() : 'Ожидает'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-bold text-brand-black/40">Подписей пока нет.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-brand-aquamarine/10 rounded-2xl border border-brand-aquamarine/30">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-black/60 mb-2">Инструкция</h3>
                <p className="text-xs font-bold text-brand-black/50">
                  Для подписи нужен аккаунт. Используйте NCALayer для подписания ЭЦП.
                </p>
              </div>

              {!data.is_signed && (
                <div className="p-4 bg-white rounded-2xl border border-brand-black/5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Подписание ЭЦП</h4>

                  {!token && (
                    <div className="text-xs font-bold text-brand-black/40">Войдите в систему, чтобы подписать.</div>
                  )}

                  {token && (
                    <button
                      type="button"
                      onClick={handleSignWithNca}
                      disabled={isSigning || verifyMutation.isPending}
                      className="w-full bg-brand-black text-brand-eggshell py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-50"
                    >
                      {isSigning || verifyMutation.isPending ? (
                        <Loader2 className="animate-spin mx-auto" size={16} />
                      ) : (
                        'Подписать через NCALayer'
                      )}
                    </button>
                  )}

                  {operation && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">
                      Операция #{operation.operation_id} (до {operation.expires_at})
                    </div>
                  )}

                  {signError && (
                    <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                      <XCircle size={14} /> {signError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDocumentPage;
