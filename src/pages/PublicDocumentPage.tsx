import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { 
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { signingApi } from '../lib/api';

const PublicDocumentPage = () => {
  const { publicId } = useParams({ from: '/public/documents/$publicId' });
  const [operation, setOperation] = useState<any>(null);
  const [signedXML, setSignedXML] = useState('');
  const [xmlCopied, setXmlCopied] = useState(false);
  const token = localStorage.getItem('token');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-doc', publicId],
    queryFn: () => signingApi.publicVerify(publicId).then(res => res.data),
  });

  const initMutation = useMutation({
    mutationFn: () => signingApi.init(data.document_id).then(res => res.data),
    onSuccess: (resp) => setOperation(resp),
  });

  const verifyMutation = useMutation({
    mutationFn: () => signingApi.verify(operation.operation_id, signedXML).then(res => res.data),
    onSuccess: () => {
      setSignedXML('');
      setOperation(null);
      refetch();
    },
  });

  const handleCopyXml = async () => {
    if (!operation?.xml_to_sign) return;
    try {
      await navigator.clipboard.writeText(operation.xml_to_sign);
      setXmlCopied(true);
      setTimeout(() => setXmlCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy XML', err);
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
          <h1 className="text-xl font-black text-brand-black mb-2">Document not found</h1>
          <p className="text-sm font-bold text-brand-black/40">The verification link may be invalid or expired.</p>
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
                <span className="text-xs font-black uppercase tracking-widest">Public Verification</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-black">Document Signature Status</h1>
              <p className="text-brand-black/40 font-medium mt-2">Verify signing state and view audit details.</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
              data.is_signed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {data.is_signed ? 'Signed by both parties' : 'Awaiting signatures'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 mt-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">Document ID</div>
                  <div className="text-sm font-black text-brand-black">{data.document_id}</div>
                </div>
                <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">Template</div>
                  <div className="text-sm font-black text-brand-black">{data.template_type}</div>
                </div>
                <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">Status</div>
                  <div className="text-sm font-black text-brand-black">{data.status}</div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-[32px] border border-brand-black/5">
                <div className="flex items-center gap-2 mb-4 text-brand-black/40">
                  <FileText size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Signatures</h2>
                </div>
                {Array.isArray(data.signatures) && data.signatures.length > 0 ? (
                  <div className="space-y-3">
                    {data.signatures.map((sig: any) => (
                      <div key={sig.id} className="flex items-center justify-between gap-4 p-3 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5">
                        <div>
                          <div className="text-sm font-black text-brand-black">{sig.signer_name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">IIN: {sig.signer_iin}</div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">
                          {sig.signed_at ? new Date(sig.signed_at).toLocaleString() : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-bold text-brand-black/40">No signatures recorded yet.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-brand-aquamarine/10 rounded-2xl border border-brand-aquamarine/30">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-black/60 mb-2">Signing Guidance</h3>
                <p className="text-xs font-bold text-brand-black/50">
                  Signatures require an authenticated account. Use NCALayer or your EDS tool to sign the XML payload.
                </p>
              </div>

              {!data.is_signed && (
                <div className="p-4 bg-white rounded-2xl border border-brand-black/5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">EDS Signing</h4>

                  {!token && (
                    <div className="text-xs font-bold text-brand-black/40">Log in to start signing.</div>
                  )}

                  {token && !operation && (
                    <button
                      type="button"
                      onClick={() => initMutation.mutate()}
                      disabled={initMutation.isPending}
                      className="w-full bg-brand-black text-brand-eggshell py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-50"
                    >
                      {initMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Start Signing'}
                    </button>
                  )}

                  {operation && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">
                        Operation #{operation.operation_id} (expires {operation.expires_at})
                      </div>
                      <textarea
                        value={operation.xml_to_sign}
                        readOnly
                        className="w-full bg-brand-eggshell/60 border-2 border-transparent rounded-2xl py-3 px-3 font-mono text-[10px] min-h-[120px]"
                      />
                      <button
                        type="button"
                        onClick={handleCopyXml}
                        className="w-full bg-brand-eggshell text-brand-black py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Copy size={12} />
                        {xmlCopied ? 'Copied' : 'Copy XML'}
                      </button>
                      <textarea
                        value={signedXML}
                        onChange={(e) => setSignedXML(e.target.value)}
                        placeholder="Paste signed XML here"
                        className="w-full bg-white border-2 border-transparent rounded-2xl py-3 px-3 font-mono text-[10px] min-h-[120px] focus:border-brand-aquamarine focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => verifyMutation.mutate()}
                        disabled={verifyMutation.isPending || signedXML.length === 0}
                        className="w-full bg-brand-aquamarine text-brand-black py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {verifyMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                        Verify Signature
                      </button>
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
