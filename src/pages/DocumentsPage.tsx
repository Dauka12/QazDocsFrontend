import React, { useEffect, useState } from 'react';
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
  ShieldCheck,
  Send,
  Link2,
  Copy,
  PencilLine,
  Eye,
  UserPlus,
  Scale
} from 'lucide-react';
import { assignmentApi, authApi, counterpartyApi, docApi, lawyerReviewApi, orgApi } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { useWorkspace } from '../hooks/useWorkspace';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import SendToLawyerModal from '../components/SendToLawyerModal';

const formatBIN = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

const formatPrice = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatDocStatus = (status?: string) => {
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
  const [editedContent, setEditedContent] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shareDoc, setShareDoc] = useState<any>(null);
  const [shareSearch, setShareSearch] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Workspace integration
  const {
    workspace: docsScope,
    selectedOrgId,
    switchToPersonal,
    switchToOrg,
    organizations: orgs
  } = useWorkspace();

  const [lawyerDoc, setLawyerDoc] = useState<any>(null);
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
  const debouncedShareSearch = useDebounce(shareSearch, 300);

  useEffect(() => {
    if (generationResult?.content) {
      setEditedContent(generationResult.content);
      setPreviewMode('edit');
    } else {
      setEditedContent(null);
    }
  }, [generationResult]);



  // Removed redundant orgs query and effect since we use global state now

  const wizardOrgId = wizardData.organization_id || selectedOrgId || 1;

  // Auto-fill states
  const { data: profiles } = useQuery({
    queryKey: ['profiles', wizardOrgId],
    queryFn: () => orgApi.listProfiles(wizardOrgId).then(res => res.data),
    enabled: isGenerateDocOpen && step === 2 && !!wizardOrgId
  });

  const { data: counterparties } = useQuery({
    queryKey: ['counterparties', wizardOrgId],
    queryFn: () => counterpartyApi.list(wizardOrgId).then(res => res.data),
    enabled: isGenerateDocOpen && step === 2 && !!wizardOrgId
  });

  const { data: userResults, isFetching: isSearchingUsers } = useQuery({
    queryKey: ['user-search', debouncedShareSearch],
    queryFn: () => authApi.searchUsers(debouncedShareSearch).then(res => res.data),
    enabled: !!shareDoc && debouncedShareSearch.length > 2,
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => docApi.listTemplates().then(res => res.data),
    enabled: true,
  });

  const { data: myDocs, isLoading: isLoadingMyDocs } = useQuery({
    queryKey: ['documents', 'personal'],
    queryFn: () => docApi.listMyDocuments().then(res => res.data),
  });

  const { data: orgDocs, isLoading: isLoadingOrgDocs } = useQuery({
    queryKey: ['documents', 'organization', selectedOrgId],
    queryFn: () => docApi.listOrganizationDocuments(selectedOrgId as number).then(res => res.data),
    enabled: docsScope === 'organization' && !!selectedOrgId,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sent-requests'],
    queryFn: () => lawyerReviewApi.sent().then(res => res.data),
  });

  const { data: sentAssignments = [] } = useQuery({
    queryKey: ['sent-assignments'],
    queryFn: () => assignmentApi.listSent().then(res => res.data),
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

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: any }) => docApi.update(id, { content }).then(res => res.data),
    onSuccess: (data) => {
      setGenerationResult(data);
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

  const assignMutation = useMutation({
    mutationFn: ({ docId, data }: { docId: number; data: any }) => assignmentApi.assign(docId, data),
    onSuccess: () => {
      setShareSearch('');
      setShareMessage('');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const toFileName = (title: string, format: 'pdf' | 'docx') => {
    const sanitized = title.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').trim();
    return `${sanitized || 'document'}.${format}`;
  };

  const handleExport = async (id: number, format: 'pdf' | 'docx') => {
    try {
      const res = format === 'pdf' ? await docApi.exportPdf(id) : await docApi.exportDocx(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', toFileName(getDocumentTitle(id), format));
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

  const updateSection = (index: number, field: 'title' | 'text', value: string) => {
    setEditedContent((prev: any) => {
      if (!prev) return prev;
      const sections = Array.isArray(prev.document_sections) ? [...prev.document_sections] : [];
      sections[index] = { ...sections[index], [field]: value };
      return { ...prev, document_sections: sections };
    });
  };

  const persistEdits = async () => {
    if (!generationResult || !editedContent) return generationResult;
    const hasChanges = JSON.stringify(editedContent) !== JSON.stringify(generationResult.content);
    if (!hasChanges) return generationResult;
    return updateMutation.mutateAsync({ id: generationResult.id, content: editedContent });
  };

  const handleSaveDraft = async () => {
    try {
      await persistEdits();
      setIsGenerateDocOpen(false);
      setStep(1);
      setGenerationResult(null);
    } catch (err) {
      console.error('Failed to save draft', err);
    }
  };

  const handleApprove = async () => {
    try {
      await persistEdits();
      if (generationResult?.id) {
        approveMutation.mutate(generationResult.id);
      }
    } catch (err) {
      console.error('Failed to approve', err);
    }
  };

  const shareLink = shareDoc?.public_id
    ? `${window.location.origin}/public/documents/${shareDoc.public_id}`
    : '';

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleAssign = (user: any) => {
    if (!shareDoc) return;
    const userId = user?.id || user?.ID;
    if (!userId) return;
    assignMutation.mutate({
      docId: shareDoc.id,
      data: {
        to_user_id: userId,
        action: 'SIGN',
        message: shareMessage || 'Пожалуйста, подпишите документ с помощью ЭЦП.',
      }
    });
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardData.params.counterparty_bin.length !== 12) {
      setValidationError('БИН должен состоять из 12 цифр');
      return;
    }
    if (!wizardData.params.deadline) {
      setValidationError('Выберите срок исполнения');
      return;
    }
    setValidationError(null);
    generateMutation.mutate(wizardData);
  };

  const displayContent = editedContent || generationResult?.content || {};
  const docs = docsScope === 'personal' ? myDocs : orgDocs;
  const isLoadingDocs = docsScope === 'personal' ? isLoadingMyDocs : isLoadingOrgDocs;
  const emptyDocsMessage = docsScope === 'personal'
    ? 'Личные документы пока не созданы.'
    : Array.isArray(orgs) && orgs.length === 0
      ? 'Сначала создайте организацию.'
      : selectedOrgId
        ? 'Документы организации пока не созданы.'
        : 'Выберите организацию для просмотра документов.';

  const signAssignments = Array.isArray(sentAssignments)
    ? sentAssignments.filter((assignment: any) => assignment.action_required === 'SIGN' && assignment.status === 'PENDING')
    : [];

  const lawyerReviewRequests = Array.isArray(sentRequests)
    ? sentRequests.filter((req: any) => req.status === 'NEW' || req.status === 'IN_PROGRESS')
    : [];

  const templateMap = Array.isArray(templates)
    ? new Map(templates.map((tmpl: any) => [tmpl.id, tmpl.name]))
    : new Map();

  const getDocumentTitle = (docId: number) => {
    const pool = Array.isArray(myDocs) ? myDocs : [];
    const orgPool = Array.isArray(orgDocs) ? orgDocs : [];
    const doc = [...pool, ...orgPool].find((item: any) => item.id === docId);
    const templateTitle = doc?.template_id ? templateMap.get(doc.template_id) : null;
    return doc?.name || templateTitle || `Документ #${docId}`;
  };

  const getDocumentTitleFromDoc = (doc: any) => {
    if (!doc) return 'Документ';
    const templateTitle = doc.template_id ? templateMap.get(doc.template_id) : null;
    return doc.name || templateTitle || `Документ #${doc.id}`;
  };

  const getLawyerReviewStatus = (docId: number) => {
    const related = Array.isArray(sentRequests)
      ? sentRequests.filter((req: any) => req.document_id === docId)
      : [];
    if (related.length === 0) return null;
    if (related.some((req: any) => req.status === 'NEW' || req.status === 'IN_PROGRESS')) {
      return { label: 'На проверке у юриста', color: 'bg-yellow-100 text-yellow-700' };
    }
    const completed = related.find((req: any) => req.status === 'COMPLETED');
    if (completed) {
      return completed.legality_confirmed
        ? { label: 'Проверено юристом', color: 'bg-green-100 text-green-700' }
        : { label: 'Есть замечания юриста', color: 'bg-red-100 text-red-700' };
    }
    return null;
  };

  const getSigningStatus = (docId: number) => {
    const related = Array.isArray(sentAssignments)
      ? sentAssignments.filter((assignment: any) => assignment.document_id === docId)
      : [];
    if (related.some((assignment: any) => assignment.action_required === 'SIGN' && assignment.status === 'PENDING')) {
      return { label: 'На подписи', color: 'bg-blue-100 text-blue-700' };
    }
    return null;
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-black mb-2">Документы</h1>
          <p className="text-brand-black/40 font-bold uppercase tracking-widest text-sm">Управляйте интеллектуальным юридическим пространством.</p>
        </div>
        <button
          onClick={() => {
            if (docsScope === 'organization' && selectedOrgId) {
              setWizardData((prev) => ({ ...prev, organization_id: selectedOrgId }));
            }
            setIsGenerateDocOpen(true);
          }}
          className="bg-brand-aquamarine text-brand-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={20} />
          Создать документ
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="inline-flex items-center bg-brand-eggshell rounded-2xl p-1 border border-brand-black/5">
          <button
            type="button"
            onClick={() => switchToPersonal()}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${docsScope === 'personal' ? 'bg-brand-black text-brand-eggshell shadow-lg' : 'text-brand-black/40 hover:text-brand-black'
              }`}
          >
            Мои документы
          </button>
          <button
            type="button"
            onClick={() => {
              if (orgs.length > 0) switchToOrg(orgs[0].organization_id);
            }}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${docsScope === 'organization' ? 'bg-brand-black text-brand-eggshell shadow-lg' : 'text-brand-black/40 hover:text-brand-black'
              }`}
          >
            Документы организации
          </button>
        </div>

        {docsScope === 'organization' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-brand-black/40">Организация</span>
            <select
              value={selectedOrgId ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value) switchToOrg(Number(value));
              }}
              className="bg-white border border-brand-black/10 rounded-2xl py-3 px-4 font-bold focus:outline-none focus:ring-4 focus:ring-brand-aquamarine/10 focus:border-brand-aquamarine/50 transition-all"
            >
              <option value="">Выберите организацию</option>
              {Array.isArray(orgs) && orgs.map((org: any) => (
                <option key={org.organization_id} value={org.organization_id}>{org.organization_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {docsScope === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-[32px] border border-brand-black/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-brand-black">На подписи</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-black/40">
                  {signAssignments.length} {signAssignments.length === 1 ? 'документ' : 'документов'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                <ShieldCheck size={20} className="text-blue-700" />
              </div>
            </div>
            {signAssignments.length === 0 ? (
              <p className="text-sm font-bold text-brand-black/40">Нет документов, направленных на подпись.</p>
            ) : (
              <div className="space-y-3">
                {signAssignments.slice(0, 3).map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-brand-eggshell/60 rounded-2xl">
                    <div>
                      <div className="text-sm font-black text-brand-black">{getDocumentTitle(assignment.document_id)}</div>
                      <div className="text-xs text-brand-black/50">
                        Получатель: {assignment.to_user_name || assignment.to_user_id}
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                      Ожидает
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[32px] border border-brand-black/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-brand-black">На проверке у юриста</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-black/40">
                  {lawyerReviewRequests.length} {lawyerReviewRequests.length === 1 ? 'заявка' : 'заявок'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Scale size={20} className="text-yellow-700" />
              </div>
            </div>
            {lawyerReviewRequests.length === 0 ? (
              <p className="text-sm font-bold text-brand-black/40">Нет документов на проверке.</p>
            ) : (
              <div className="space-y-3">
                {lawyerReviewRequests.slice(0, 3).map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-brand-eggshell/60 rounded-2xl">
                    <div>
                      <div className="text-sm font-black text-brand-black">{getDocumentTitle(req.document_id)}</div>
                      <div className="text-xs text-brand-black/50">
                        Юрист: {req.lawyer_name || 'Свободный юрист'}
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                      {req.status === 'NEW' ? 'Новая' : 'В работе'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={24} />
        <input
          type="text"
          placeholder="Поиск документов..."
          className="w-full bg-white border border-brand-black/5 rounded-[24px] py-6 pl-16 pr-8 focus:outline-none focus:ring-4 focus:ring-brand-aquamarine/10 focus:border-brand-aquamarine/50 transition-all font-bold text-lg"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-brand-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-eggshell border-b border-brand-black/5">
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Документ</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Тип</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Статус</th>
              <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-black/40">Дата</th>
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
                      <div>
                        <div className="font-bold text-brand-black">{getDocumentTitleFromDoc(doc)}</div>
                        {getSigningStatus(doc.id) && (
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getSigningStatus(doc.id)?.color}`}>
                            {getSigningStatus(doc.id)?.label}
                          </span>
                        )}
                        {getLawyerReviewStatus(doc.id) && (
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getLawyerReviewStatus(doc.id)?.color}`}>
                            {getLawyerReviewStatus(doc.id)?.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">{doc.type || 'Юридический'}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                      doc.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                      {formatDocStatus(doc.status)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-brand-black/60">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShareDoc(doc)}
                        className="p-2 hover:bg-brand-black/5 text-brand-black/40 hover:text-brand-black rounded-lg transition-all"
                        title="Отправить на подпись"
                      >
                        <Send size={20} />
                      </button>
                      <button
                        onClick={() => setLawyerDoc(doc)}
                        className="p-2 hover:bg-brand-black/5 text-brand-black/40 hover:text-brand-black rounded-lg transition-all"
                        title="Отправить на проверку юристу"
                      >
                        <Scale size={20} />
                      </button>
                      {doc.status === 'DRAFT' && (
                        <button
                          onClick={() => approveMutation.mutate(doc.id)}
                          className="p-2 hover:bg-brand-aquamarine/20 text-brand-aquamarine rounded-lg transition-all"
                          title="Утвердить"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      {(doc.status === 'APPROVED' || doc.status === 'SIGNED') && (
                        <>
                          <button
                            onClick={() => handleExport(doc.id, 'pdf')}
                            className="p-2 hover:bg-brand-black/5 text-brand-black/40 hover:text-red-500 rounded-lg transition-all"
                            title="Экспорт PDF"
                          >
                            <FileDown size={20} />
                          </button>
                          <button
                            onClick={() => handleExport(doc.id, 'docx')}
                            className="p-2 hover:bg-brand-black/5 text-brand-black/40 hover:text-blue-500 rounded-lg transition-all"
                            title="Экспорт DOCX"
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
                  <p className="text-brand-black/40 font-bold">{emptyDocsMessage}</p>
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
                  setEditedContent(null);
                  setPreviewMode('edit');
                }}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">
                {step === 1 ? 'Выберите шаблон' : step === 2 ? 'Параметры документа' : 'Предпросмотр документа'}
              </h2>
              <p className="text-brand-black/40 font-medium mb-8">
                {step === 1 ? 'Выберите основу для документа.' : step === 2 ? 'ИИ нужен контекст для точного юридического текста.' : 'Проверьте документ перед сохранением.'}
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
                            <h4 className="text-xs font-black uppercase tracking-widest">Наши реквизиты (исполнитель)</h4>
                          </div>
                          {profiles?.length > 0 && (
                            <select
                              onChange={(e) => {
                                const p = profiles.find((pr: any) => pr.id === parseInt(e.target.value));
                                if (p) applyProfile(p);
                              }}
                              className="text-[10px] font-black uppercase bg-brand-aquamarine/10 border-none rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="">Заполнить</option>
                              {profiles.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Название компании"
                            value={wizardData.params.org_name}
                            onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, org_name: e.target.value } })}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <input
                            type="text"
                            placeholder="БИН"
                            value={formatBIN(wizardData.params.org_bin)}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                              setWizardData({ ...wizardData, params: { ...wizardData.params, org_bin: raw } });
                            }}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="ФИО подписанта"
                              value={wizardData.params.org_signer_name}
                              onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, org_signer_name: e.target.value } })}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Основание (например, Устав)"
                              value={wizardData.params.org_signer_basis}
                              onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, org_signer_basis: e.target.value } })}
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
                            <h4 className="text-xs font-black uppercase tracking-widest">Контрагент (заказчик)</h4>
                          </div>
                          {counterparties?.length > 0 && (
                            <select
                              onChange={(e) => {
                                const cp = counterparties.find((c: any) => c.id === parseInt(e.target.value));
                                if (cp) applyCounterparty(cp);
                              }}
                              className="text-[10px] font-black uppercase bg-brand-black/5 border-none rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="">Заполнить</option>
                              {counterparties.map((cp: any) => (
                                <option key={cp.id} value={cp.id}>{cp.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Название компании"
                            value={wizardData.params.counterparty_name}
                            onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, counterparty_name: e.target.value } })}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="БИН (12 цифр)"
                              value={formatBIN(wizardData.params.counterparty_bin)}
                              onChange={e => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                                setWizardData({ ...wizardData, params: { ...wizardData.params, counterparty_bin: raw } });
                              }}
                              className={`w-full bg-brand-eggshell/50 border-2 rounded-2xl py-3 px-4 focus:outline-none transition-all font-bold ${wizardData.params.counterparty_bin.length === 12 ? 'border-brand-aquamarine/30 focus:border-brand-aquamarine' : 'border-transparent focus:border-brand-aquamarine'
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
                              placeholder="ФИО подписанта"
                              value={wizardData.params.counterparty_signer_name}
                              onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, counterparty_signer_name: e.target.value } })}
                              className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Основание (например, Устав)"
                              value={wizardData.params.counterparty_signer_basis}
                              onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, counterparty_signer_basis: e.target.value } })}
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
                          <h4 className="text-xs font-black uppercase tracking-widest">Место и дата</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Место (например, Алматы)"
                            value={wizardData.params.contract_place}
                            onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, contract_place: e.target.value } })}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                          <input
                            type="date"
                            value={wizardData.params.contract_date}
                            onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, contract_date: e.target.value } })}
                            className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                            required
                          />
                        </div>
                      </div>

                      {/* Deal Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-black/40">
                          <FileText size={18} />
                          <h4 className="text-xs font-black uppercase tracking-widest">Условия сделки</h4>
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
                                    setWizardData({ ...wizardData, params: { ...wizardData.params, currency: curr.code } });
                                  }}
                                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${selectedCurrency.code === curr.code ? 'bg-white text-brand-black shadow-sm scale-105' : 'text-brand-black/20 hover:text-brand-black/40'
                                    }`}
                                >
                                  {curr.symbol} {curr.code}
                                </button>
                              ))}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={`Цена (${selectedCurrency.symbol})`}
                                value={formatPrice(wizardData.params.price)}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  setWizardData({ ...wizardData, params: { ...wizardData.params, price: raw } });
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
                                {wizardData.params.deadline ? format(new Date(wizardData.params.deadline), 'PPP') : 'Выберите срок'}
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
                                        setWizardData({ ...wizardData, params: { ...wizardData.params, deadline: date.toISOString() } });
                                        setShowCalendar(false);
                                      }
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <textarea
                            placeholder="Описание услуг (например, продажа автомобильных дисков)"
                            value={wizardData.params.services}
                            onChange={e => setWizardData({ ...wizardData, params: { ...wizardData.params, services: e.target.value } })}
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
                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-black/40">Жесткость договора</h4>
                    <div className="flex gap-4">
                      {['SOFT', 'STANDARD', 'STRICT'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, strictness: s as any })}
                          className={`flex-1 py-3 rounded-xl font-black transition-all ${wizardData.strictness === s ? 'bg-brand-black text-white shadow-lg scale-105' : 'bg-brand-eggshell text-brand-black/40 hover:bg-brand-black/5'}`}
                        >
                          {s === 'SOFT' ? 'Мягкий' : s === 'STANDARD' ? 'Стандартный' : 'Жесткий'}
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
                      Назад
                    </button>
                    <button
                      type="submit"
                      disabled={generateMutation.isPending}
                      className="flex-[2] bg-brand-black text-brand-eggshell py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                      {generateMutation.isPending ? <Loader2 className="animate-spin" /> : 'Сгенерировать с ИИ'}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && generationResult && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('edit')}
                        className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${previewMode === 'edit' ? 'bg-brand-black text-white shadow-lg' : 'bg-brand-eggshell text-brand-black/40 hover:bg-brand-black/5'
                          }`}
                      >
                        <PencilLine size={14} /> Редактирование
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('preview')}
                        className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${previewMode === 'preview' ? 'bg-brand-black text-white shadow-lg' : 'bg-brand-eggshell text-brand-black/40 hover:bg-brand-black/5'
                          }`}
                      >
                        <Eye size={14} /> Просмотр
                      </button>
                    </div>
                    {updateMutation.isPending && (
                      <span className="text-xs font-black uppercase tracking-widest text-brand-black/40">Сохранение изменений...</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
                    <div className="max-h-[500px] overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                      {previewMode === 'edit' ? (
                        Array.isArray(displayContent.document_sections) && displayContent.document_sections.length > 0 ? (
                          displayContent.document_sections.map((s: any, i: number) => (
                            <div key={i} className="bg-brand-eggshell/60 rounded-2xl border border-brand-black/5 p-4 space-y-3">
                              <div className="flex items-center justify-between gap-4">
                                <input
                                  type="text"
                                  value={s.title || ''}
                                  onChange={(e) => updateSection(i, 'title', e.target.value)}
                                  className="w-full bg-white/80 border-2 border-transparent rounded-xl py-2 px-3 focus:border-brand-aquamarine focus:outline-none transition-all font-black text-brand-black"
                                  placeholder="Заголовок раздела"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">№{i + 1}</span>
                              </div>
                              <textarea
                                value={s.text || ''}
                                onChange={(e) => updateSection(i, 'text', e.target.value)}
                                className="w-full bg-white/80 border-2 border-transparent rounded-xl py-3 px-3 focus:border-brand-aquamarine focus:outline-none transition-all font-bold text-sm text-brand-black/80 min-h-[140px]"
                                placeholder="Текст раздела"
                              />
                              {s.citations?.length > 0 && (
                                <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">
                                  Ссылки: {s.citations.join(', ')}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-brand-eggshell/60 rounded-2xl text-sm font-bold text-brand-black/40 text-center">
                            Разделы пока не сформированы.
                          </div>
                        )
                      ) : (
                        Array.isArray(displayContent.document_sections) && displayContent.document_sections.length > 0 ? (
                          displayContent.document_sections.map((s: any, i: number) => (
                            <div key={i} className="prose prose-sm max-w-none">
                              <h3 className="text-xl font-black text-brand-black mb-4 pb-2 border-b border-brand-black/5">{s.title}</h3>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="text-brand-black/70 mb-4 leading-relaxed font-medium">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-brand-black/70 font-medium">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-brand-black/70 font-medium">{children}</ol>,
                                  li: ({ children }) => <li>{children}</li>,
                                  strong: ({ children }) => <strong className="font-black text-brand-black">{children}</strong>,
                                }}
                              >
                                {s.text}
                              </ReactMarkdown>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-brand-eggshell/60 rounded-2xl text-sm font-bold text-brand-black/40 text-center">
                            Разделы пока не сформированы.
                          </div>
                        )
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-brand-eggshell/50 rounded-2xl border border-brand-black/5">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-2">Данные документа</h5>
                        <div className="text-xs font-bold text-brand-black/60">ID документа: {generationResult.id}</div>
                        <div className="text-xs font-bold text-brand-black/60">Статус: {formatDocStatus(generationResult.status)}</div>
                      </div>

                      {displayContent.open_questions?.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <h5 className="text-xs font-black uppercase text-blue-500 mb-2">Недостающая информация</h5>
                          <ul className="space-y-1">
                            {displayContent.open_questions.map((q: any, i: number) => (
                              <li key={i} className="text-xs font-bold text-blue-600/80 flex items-start gap-2">
                                <span className="text-blue-500">?</span> {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {displayContent.risk_flags?.length > 0 && (
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                          <h5 className="text-xs font-black uppercase text-red-500 mb-2">Риски ИИ</h5>
                          <ul className="space-y-1">
                            {displayContent.risk_flags.map((r: any, i: number) => (
                              <li key={i} className="text-xs font-bold text-red-600/80 flex items-start gap-2">
                                <span className="text-red-500">•</span> {r.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveDraft}
                      disabled={updateMutation.isPending}
                      className="flex-1 bg-brand-eggshell text-brand-black py-4 rounded-2xl font-black hover:bg-brand-black/5 transition-all disabled:opacity-60"
                    >
                      Сохранить как черновик
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={approveMutation.isPending || updateMutation.isPending}
                      className="flex-1 bg-brand-aquamarine text-brand-black py-4 rounded-2xl font-black hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {approveMutation.isPending ? <Loader2 className="animate-spin" /> : (
                        <>
                          <CheckCircle size={20} />
                          Утвердить и сохранить
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

      <AnimatePresence>
        {shareDoc && (
          <div className="fixed inset-0 bg-brand-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-4xl w-full shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShareDoc(null);
                  setShareSearch('');
                  setShareMessage('');
                  setLinkCopied(false);
                }}
                className="absolute top-8 right-8 text-brand-black/20 hover:text-brand-black transition-colors"
              >
                <Plus size={32} className="rotate-45" />
              </button>

              <h2 className="text-3xl font-black text-brand-black mb-2">Отправить на подпись</h2>
              <p className="text-brand-black/40 font-medium mb-8">Пригласите пользователя или отправьте ссылку на подпись.</p>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-black/40">
                    <UserPlus size={18} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Отправить пользователю</h4>
                  </div>

                  <input
                    type="text"
                    value={shareSearch}
                    onChange={(e) => setShareSearch(e.target.value)}
                    placeholder="Поиск по email или телефону"
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold"
                  />

                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Сообщение подписанту (необязательно)"
                    className="w-full bg-brand-eggshell/50 border-2 border-transparent rounded-2xl py-3 px-4 focus:border-brand-aquamarine focus:outline-none transition-all font-bold min-h-[100px]"
                  />

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                    {isSearchingUsers && (
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-black/40">
                        <Loader2 size={14} className="animate-spin" /> Поиск...
                      </div>
                    )}
                    {Array.isArray(userResults) && userResults.length > 0 && userResults.map((user: any) => {
                      const displayLabel = user.email || user.Email || user.phone || user.Phone || user.id || user.ID;
                      const roleLabel = user.role_name || user.RoleName || 'User';
                      return (
                        <div key={user.id || user.ID} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-brand-black/5 bg-brand-eggshell/40">
                          <div>
                            <div className="text-sm font-black text-brand-black">{displayLabel}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">{roleLabel}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAssign(user)}
                            disabled={assignMutation.isPending}
                            className="bg-brand-black text-brand-eggshell px-3 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-50"
                          >
                            Отправить
                          </button>
                        </div>
                      );
                    })}
                    {debouncedShareSearch.length > 2 && !isSearchingUsers && (!userResults || userResults.length === 0) && (
                      <div className="text-xs font-bold text-brand-black/40">Пользователи не найдены.</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-black/40">
                    <Link2 size={18} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Ссылка</h4>
                  </div>

                  <div className="p-4 bg-brand-eggshell/60 rounded-2xl border border-brand-black/5 space-y-3">
                    <div className="text-xs font-bold text-brand-black/70 break-all">{shareLink || 'Ссылка пока недоступна.'}</div>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      disabled={!shareLink}
                      className="w-full bg-brand-aquamarine text-brand-black py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Copy size={14} />
                      {linkCopied ? 'Скопировано' : 'Скопировать ссылку'}
                    </button>
                  </div>

                  <div className="p-4 bg-brand-aquamarine/10 rounded-2xl border border-brand-aquamarine/30">
                    <div className="text-xs font-bold text-brand-black/60">
                      Эта ссылка открывает публичную проверку, которую использует QR в экспортах.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SendToLawyerModal
        isOpen={!!lawyerDoc}
        onClose={() => setLawyerDoc(null)}
        documentId={lawyerDoc?.id}
        documentTitle={lawyerDoc?.name || `Документ #${lawyerDoc?.id}`}
        organizationId={lawyerDoc?.organization_id}
      />
    </div>
  );
};

export default DocumentsPage;
