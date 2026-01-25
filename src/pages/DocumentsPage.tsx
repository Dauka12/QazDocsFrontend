import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  ChevronRight,
  Loader2,
  Search
} from 'lucide-react';
import { docApi, aiApi } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DocumentsPage = () => {
  const queryClient = useQueryClient();
  const [isGenerateDocOpen, setIsGenerateDocOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [generationResult, setGenerationResult] = useState<any>(null);
  
  const [newDoc, setNewDoc] = useState({ 
    document_type: 'service_contract',
    organization: {
      name: 'My Company LLP',
      bin: '123456789012',
      address: 'Almaty, Dostyk 1',
      signer_name: 'Directorov D.',
      signer_basis: 'Charter'
    },
    counterparty: {
      name: '',
      bin: '',
      address: '',
      signer_name: '',
      signer_basis: ''
    },
    deal_details: {
      price: '',
      deadline: '',
      services: ''
    },
    strictness: 'standard'
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => docApi.listTemplates().then(res => res.data),
    enabled: isGenerateDocOpen,
  });

  const { data: docs, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: () => docApi.listDocuments(1).then(res => res.data), // Hardcoded orgId for demo
  });

  const generateMutation = useMutation({
    mutationFn: aiApi.generate,
    onSuccess: (res) => {
      setGenerationResult(res.data);
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(newDoc);
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">All Documents</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Manage your intelligent legal workspace.</p>
        </div>
        <button 
          onClick={() => setIsGenerateDocOpen(true)}
          className="bg-brand-aquamarine text-brand-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={20} />
          Generate Document
        </button>
      </div>

      <div className="mb-8 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={24} />
        <input 
          type="text" 
          placeholder="Search documents..."
          className="w-full bg-white border border-brand-black/5 rounded-[24px] py-6 pl-16 pr-8 focus:outline-none focus:ring-4 focus:ring-brand-aquamarine/10 focus:border-brand-aquamarine/50 transition-all font-bold text-lg"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-brand-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-eggshell border-b border-brand-black/5">
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Document Name</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Type</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Status</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Date</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoadingDocs ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : docs?.length > 0 ? (
              docs.map((doc: any) => (
                <tr key={doc.id} className="border-b border-brand-black/5 hover:bg-brand-eggshell/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-aquamarine/20 rounded-xl flex items-center justify-center">
                        <FileText className="text-brand-aquamarine" size={20} />
                      </div>
                      <span className="font-bold text-brand-black">{doc.name || 'Service Agreement'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">{doc.type || 'Legal'}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-black uppercase tracking-wider">Completed</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">Jan 25, 2026</td>
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
                  <FileText size={48} className="mx-auto text-brand-black/10 mb-4" />
                  <p className="text-brand-black/40 font-bold">No documents generated yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Document Modal */}
      <AnimatePresence>
        {isGenerateDocOpen && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-2xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => {
                  setIsGenerateDocOpen(false);
                  setStep(1);
                  setGenerationResult(null);
                }}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">
                {step === 1 ? 'Choose Template' : step === 2 ? 'Document Details' : 'Preview Document'}
              </h2>
              <p className="text-brand-black/40 font-medium mb-8">
                {step === 1 ? 'Select the base for your document.' : step === 2 ? 'AI needs some context to generate a precise legal document.' : 'Review your AI-generated legal document before saving.'}
              </p>

              {step === 1 && (
                <div className="grid grid-cols-1 gap-4">
                  {templates?.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setNewDoc({ ...newDoc, document_type: t.type.toLowerCase() });
                        setStep(2);
                      }}
                      className="flex items-center justify-between p-6 bg-brand-eggshell/50 hover:bg-brand-aquamarine/10 border-2 border-transparent hover:border-brand-aquamarine rounded-2xl transition-all group text-left"
                    >
                      <div>
                        <h4 className="font-black text-brand-black">{t.name}</h4>
                        <p className="text-sm text-brand-black/40 font-bold">{t.description}</p>
                      </div>
                      <ChevronRight className="text-brand-black/20 group-hover:text-brand-black" />
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleCreateDoc} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Counterparty</h4>
                      <input 
                        type="text" 
                        placeholder="Company Name"
                        value={newDoc.counterparty.name}
                        onChange={e => setNewDoc({...newDoc, counterparty: {...newDoc.counterparty, name: e.target.value}})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="BIN"
                        value={newDoc.counterparty.bin}
                        onChange={e => setNewDoc({...newDoc, counterparty: {...newDoc.counterparty, bin: e.target.value}})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Address"
                        value={newDoc.counterparty.address}
                        onChange={e => setNewDoc({...newDoc, counterparty: {...newDoc.counterparty, address: e.target.value}})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Deal Details</h4>
                      <input 
                        type="text" 
                        placeholder="Price (e.g. 1 000 000 KZT)"
                        value={newDoc.deal_details.price}
                        onChange={e => setNewDoc({...newDoc, deal_details: {...newDoc.deal_details, price: e.target.value}})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Services Description"
                        value={newDoc.deal_details.services}
                        onChange={e => setNewDoc({...newDoc, deal_details: {...newDoc.deal_details, services: e.target.value}})}
                        className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        required
                      />
                      <div className="flex gap-4">
                        <select 
                          value={newDoc.strictness}
                          onChange={e => setNewDoc({...newDoc, strictness: e.target.value})}
                          className="flex-1 bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                        >
                          <option value="soft">Soft</option>
                          <option value="standard">Standard</option>
                          <option value="strict">Strict</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-brand-eggshell text-brand-black py-4 rounded-2xl font-black hover:bg-brand-black/5 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={generateMutation.isPending}
                      className="flex-[2] bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                      {generateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Generate with AI'}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && generationResult && (
                <div className="space-y-6">
                  <div className="max-h-[500px] overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                    {generationResult.document_sections?.map((s: any, i: number) => (
                      <div key={i} className="prose prose-sm max-w-none">
                        <h3 className="text-xl font-black text-brand-black mb-4 pb-2 border-b border-brand-black/5">{s.title}</h3>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({children}) => <p className="text-brand-black/70 mb-4 leading-relaxed font-medium">{children}</p>,
                            ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-brand-black/70 font-medium">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-brand-black/70 font-medium">{children}</ol>,
                            li: ({children}) => <li>{children}</li>,
                            strong: ({children}) => <strong className="font-black text-brand-black">{children}</strong>,
                          }}
                        >
                          {s.text}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                  
                  {generationResult.risk_flags?.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <h5 className="text-xs font-black uppercase text-red-500 mb-2">AI Risk Analysis</h5>
                      <ul className="space-y-1">
                        {generationResult.risk_flags.map((r: any, i: number) => (
                          <li key={i} className="text-xs font-bold text-red-600/80 flex items-start gap-2">
                            <span>•</span> {r.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setIsGenerateDocOpen(false);
                      setStep(1);
                      setGenerationResult(null);
                    }}
                    className="w-full bg-brand-aquamarine text-brand-black py-4 rounded-2xl font-black hover:shadow-lg transition-all"
                  >
                    Finish and Save
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;
