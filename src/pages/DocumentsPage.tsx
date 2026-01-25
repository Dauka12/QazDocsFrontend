import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  ChevronRight,
  Loader2,
  Search,
  CheckCircle,
  Download,
  FileDown,
  MapPin,
  Calendar,
  Building,
  User,
  ShieldCheck
} from 'lucide-react';
import { docApi, orgApi, counterpartyApi } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

const formatBIN = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

const formatPrice = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const CURRENCIES = [
  { code: 'KZT', symbol: '₸' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'RUB', symbol: '₽' },
  { code: 'GBP', symbol: '£' },
  { code: 'CNY', symbol: '¥' },
  { code: 'TRY', symbol: '₺' },
  { code: 'KRW', symbol: '₩' },
];

const DocumentsPage = () => {
  const queryClient = useQueryClient();
  const [isGenerateDocOpen, setIsGenerateDocOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-fill states
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => orgApi.listProfiles(1).then(res => res.data),
    enabled: isGenerateDocOpen && step === 2
  });

  const { data: counterparties } = useQuery({
    queryKey: ['counterparties'],
    queryFn: () => counterpartyApi.list(1).then(res => res.data),
    enabled: isGenerateDocOpen && step === 2
  });
  
  const [wizardData, setWizardData] = useState({ 
    organization_id: 1,
    counterparty_id: null as number | null,
    document_type: 'SERVICE_AGREEMENT',
    strictness: 'STANDARD',
    params: {
      price: '',
      currency: 'KZT',
      deadline: '',
      services: '',
      contract_place: 'Almaty',
      contract_date: format(new Date(), 'yyyy-MM-dd'),
      // Executor (Us)
      org_name: 'My Company LLP',
      org_bin: '123456789012',
      org_address: 'Almaty, Dostyk 1',
      org_signer_name: 'Directorov D.',
      org_signer_basis: 'Charter',
      // Counterparty
      counterparty_name: '',
      counterparty_bin: '',
      counterparty_address: '',
      counterparty_signer_name: '',
      counterparty_signer_basis: 'Charter',
    },
    additional_conditions: []
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
    mutationFn: (data: any) => docApi.wizard(data).then(res => res.data),
    onSuccess: (data) => {
      // Content is a JSON field in the Document model
      setGenerationResult(data); // Pass the whole doc for ID access
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const approveMutation = useMutation({
    mutationFn: docApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsGenerateDocOpen(false);
      setStep(1);
      setGenerationResult(null);
    }
  });

  const handleExport = async (id: number, format: 'pdf' | 'docx') => {
    try {
      const res = format === 'pdf' ? await docApi.exportPdf(id) : await docApi.exportDocx(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const applyProfile = (p: any) => {
    setWizardData({
      ...wizardData,
      params: {
        ...wizardData.params,
        org_name: p.name,
        org_address: p.legal_address?.full_address,
        org_signer_name: p.signatories?.[0]?.full_name,
        org_signer_basis: p.signatories?.[0]?.basis,
      }
    });
  };

  const applyCounterparty = (cp: any) => {
    setWizardData({
      ...wizardData,
      params: {
        ...wizardData.params,
        counterparty_name: cp.name,
        counterparty_bin: cp.bin,
        counterparty_address: cp.address?.full_address,
        counterparty_signer_name: cp.signatory?.full_name,
        counterparty_signer_basis: cp.signatory?.basis,
      },
      counterparty_id: cp.id
    });
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardData.params.counterparty_bin.length !== 12) {
      setValidationError('BIN must be exactly 12 digits');
      return;
    }
    if (!wizardData.params.deadline) {
      setValidationError('Please select a deadline');
      return;
    }
    setValidationError(null);
    generateMutation.mutate(wizardData);
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
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      doc.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                      doc.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {doc.status === 'DRAFT' && (
                        <button 
                          onClick={() => approveMutation.mutate(doc.id)}
                          className="p-2 hover:bg-brand-aquamarine/20 text-brand-aquamarine rounded-lg transition-all"
                          title="Approve"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      {(doc.status === 'APPROVED' || doc.status === 'SIGNED') && (
                        <>
                          <button 
                            onClick={() => handleExport(doc.id, 'pdf')}
                            className="p-2 hover:bg-brand-black/5 text-brand-black/40 hover:text-red-500 rounded-lg transition-all"
                            title="Export PDF"
                          >
                            <FileDown size={20} />
                          </button>
                          <button 
                            onClick={() => handleExport(doc.id, 'docx')}
                            className="p-2 hover:bg-brand-black/5 text-brand-black/40 hover:text-blue-500 rounded-lg transition-all"
                            title="Export DOCX"
                          >
                            <Download size={20} />
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-brand-eggshell rounded-lg transition-colors">
                        <ChevronRight size={20} className="text-brand-black/20" />
                      </button>
                    </div>
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
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #4AF2C1;
          --rdp-background-color: #F8F9FA;
          margin: 0;
        }
        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
          background-color: var(--rdp-accent-color);
          color: #000;
          font-weight: 900;
          border-radius: 12px;
        }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #F0F2F5;
          border-radius: 12px;
        }
      `}</style>
      <AnimatePresence>
        {isGenerateDocOpen && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-4xl w-full shadow-2xl relative my-8"
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

              {/* Progress Indicator */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-aquamarine' : 'bg-brand-eggshell'}`}
                  />
                ))}
              </div>

              {step === 1 && (
                <div className="grid grid-cols-1 gap-4">
                  {templates?.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setWizardData({ ...wizardData, document_type: t.type });
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
                <form onSubmit={handleCreateDoc} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column: Parties */}
                    <div className="space-y-8">
                      {/* Executor (Us) */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 text-brand-aquamarine">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={18} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Our Details (Executor)</h4>
                          </div>
                          {profiles?.length > 0 && (
                            <select 
                              onChange={(e) => {
                                const p = profiles.find((pr: any) => pr.id === parseInt(e.target.value));
                                if (p) applyProfile(p);
                              }}
                              className="text-[10px] font-black uppercase bg-brand-aquamarine/10 border-none rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="">Quick Fill</option>
                              {profiles.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input 
                            type="text" 
                            placeholder="Company Name"
                            value={wizardData.params.org_name}
                            onChange={e => setWizardData({...wizardData, params: {...wizardData.params, org_name: e.target.value}})}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="BIN"
                            value={formatBIN(wizardData.params.org_bin)}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                              setWizardData({...wizardData, params: {...wizardData.params, org_bin: raw}});
                            }}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input 
                              type="text" 
                              placeholder="Signer Name"
                              value={wizardData.params.org_signer_name}
                              onChange={e => setWizardData({...wizardData, params: {...wizardData.params, org_signer_name: e.target.value}})}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                              required
                            />
                            <input 
                              type="text" 
                              placeholder="Basis (e.g. Charter)"
                              value={wizardData.params.org_signer_basis}
                              onChange={e => setWizardData({...wizardData, params: {...wizardData.params, org_signer_basis: e.target.value}})}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Counterparty */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 text-brand-black/40">
                          <div className="flex items-center gap-2">
                            <Building size={18} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Counterparty (Customer)</h4>
                          </div>
                          {counterparties?.length > 0 && (
                            <select 
                              onChange={(e) => {
                                const cp = counterparties.find((c: any) => c.id === parseInt(e.target.value));
                                if (cp) applyCounterparty(cp);
                              }}
                              className="text-[10px] font-black uppercase bg-brand-black/5 border-none rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="">Quick Fill</option>
                              {counterparties.map((cp: any) => (
                                <option key={cp.id} value={cp.id}>{cp.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input 
                            type="text" 
                            placeholder="Company Name"
                            value={wizardData.params.counterparty_name}
                            onChange={e => setWizardData({...wizardData, params: {...wizardData.params, counterparty_name: e.target.value}})}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="BIN (12 digits)"
                              value={formatBIN(wizardData.params.counterparty_bin)}
                              onChange={e => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                                setWizardData({...wizardData, params: {...wizardData.params, counterparty_bin: raw}});
                              }}
                              className={`w-full bg-brand-eggshell/50 border-2 rounded-2xl py-3 px-4 focus:outline-none transition-all font-bold ${
                                wizardData.params.counterparty_bin.length === 12 ? 'border-brand-aquamarine/30 focus:border-brand-aquamarine' : 'border-transparent focus:border-brand-aquamarine'
                              }`}
                              required
                            />
                            {wizardData.params.counterparty_bin.length === 12 && (
                              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-aquamarine" size={18} />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input 
                              type="text" 
                              placeholder="Signer Name"
                              value={wizardData.params.counterparty_signer_name}
                              onChange={e => setWizardData({...wizardData, params: {...wizardData.params, counterparty_signer_name: e.target.value}})}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                              required
                            />
                            <input 
                              type="text" 
                              placeholder="Basis (e.g. Charter)"
                              value={wizardData.params.counterparty_signer_basis}
                              onChange={e => setWizardData({...wizardData, params: {...wizardData.params, counterparty_signer_basis: e.target.value}})}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Deal Details & Logistics */}
                    <div className="space-y-8">
                      {/* Logistics */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-black/40">
                          <MapPin size={18} />
                          <h4 className="text-xs font-black uppercase tracking-widest">Place & Date</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            placeholder="Place (e.g. Almaty)"
                            value={wizardData.params.contract_place}
                            onChange={e => setWizardData({...wizardData, params: {...wizardData.params, contract_place: e.target.value}})}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <input 
                            type="date" 
                            value={wizardData.params.contract_date}
                            onChange={e => setWizardData({...wizardData, params: {...wizardData.params, contract_date: e.target.value}})}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                        </div>
                      </div>

                      {/* Deal Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-black/40">
                          <FileText size={18} />
                          <h4 className="text-xs font-black uppercase tracking-widest">Deal Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex gap-2 p-1 bg-brand-eggshell/50 rounded-2xl overflow-x-auto no-scrollbar">
                              {CURRENCIES.map(curr => (
                                <button
                                  key={curr.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCurrency(curr);
                                    setWizardData({...wizardData, params: {...wizardData.params, currency: curr.code}});
                                  }}
                                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                    selectedCurrency.code === curr.code ? 'bg-white text-brand-black shadow-sm scale-105' : 'text-brand-black/20 hover:text-brand-black/40'
                                  }`}
                                >
                                  {curr.symbol} {curr.code}
                                </button>
                              ))}
                            </div>
                            <div className="relative">
                              <input 
                                type="text" 
                                placeholder={`Price (${selectedCurrency.symbol})`}
                                value={formatPrice(wizardData.params.price)}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  setWizardData({...wizardData, params: {...wizardData.params, price: raw}});
                                }}
                                className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold pr-12"
                                required
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-brand-black/20">{selectedCurrency.symbol}</span>
                            </div>
                          </div>

                          <div className="relative">
                            <button 
                              type="button"
                              onClick={() => setShowCalendar(!showCalendar)}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-left flex justify-between items-center"
                            >
                              <span className={wizardData.params.deadline ? 'text-brand-black' : 'text-brand-black/40'}>
                                {wizardData.params.deadline ? format(new Date(wizardData.params.deadline), 'PPP') : 'Select Deadline'}
                              </span>
                              <Calendar className="text-brand-black/20" size={18} />
                            </button>
                            
                            <AnimatePresence>
                              {showCalendar && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-50 top-full mt-2 right-0 bg-white border border-brand-black/5 shadow-2xl rounded-[32px] p-4"
                                >
                                  <DayPicker
                                    mode="single"
                                    selected={wizardData.params.deadline ? new Date(wizardData.params.deadline) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        setWizardData({...wizardData, params: {...wizardData.params, deadline: date.toISOString()}});
                                        setShowCalendar(false);
                                      }
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <textarea 
                            placeholder="Services Description (e.g. Sale of car wheels)"
                            value={wizardData.params.services}
                            onChange={e => setWizardData({...wizardData, params: {...wizardData.params, services: e.target.value}})}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold min-h-[80px]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {validationError && (
                    <p className="text-red-500 text-sm font-bold text-center">{validationError}</p>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Contract Strictness</h4>
                    <div className="flex gap-4">
                      {['SOFT', 'STANDARD', 'STRICT'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setWizardData({...wizardData, strictness: s as any})}
                          className={`flex-1 py-3 rounded-xl font-black transition-all ${wizardData.strictness === s ? 'bg-brand-black text-white shadow-lg scale-105' : 'bg-brand-eggshell text-brand-black/40 hover:bg-brand-black/5'}`}
                        >
                          {s}
                        </button>
                      ))}
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
                    {generationResult.content?.document_sections?.map((s: any, i: number) => (
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

                  {generationResult.content?.open_questions?.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <h5 className="text-xs font-black uppercase text-blue-500 mb-2">Missing Information</h5>
                      <ul className="space-y-1">
                        {generationResult.content.open_questions.map((q: any, i: number) => (
                          <li key={i} className="text-xs font-bold text-blue-600/80 flex items-start gap-2">
                            <span className="text-blue-500">?</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {generationResult.content?.risk_flags?.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <h5 className="text-xs font-black uppercase text-red-500 mb-2">AI Risk Analysis</h5>
                      <ul className="space-y-1">
                        {generationResult.content.risk_flags.map((r: any, i: number) => (
                          <li key={i} className="text-xs font-bold text-red-600/80 flex items-start gap-2">
                            <span className="text-red-500">•</span> {r.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setIsGenerateDocOpen(false);
                        setStep(1);
                        setGenerationResult(null);
                      }}
                      className="flex-1 bg-brand-eggshell text-brand-black py-4 rounded-2xl font-black hover:bg-brand-black/5 transition-all"
                    >
                      Save as Draft
                    </button>
                    <button 
                      onClick={() => approveMutation.mutate(generationResult.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-brand-aquamarine text-brand-black py-4 rounded-2xl font-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {approveMutation.isPending ? <Loader2 className="animate-spin" /> : (
                        <>
                          <CheckCircle size={20} />
                          Approve and Save
                        </>
                      )}
                    </button>
                  </div>
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
