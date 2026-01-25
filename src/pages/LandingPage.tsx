import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  Cpu,
  Zap,
  Users,
  History,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const LandingPage = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const { data: healthData, status: healthStatus } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get('/healthz').then(res => res.data),
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-brand-eggshell overflow-x-hidden text-brand-black font-sans">
      {/* Backend Status Floating Badge */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-md ${healthStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
              healthStatus === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                'bg-red-500/10 border-red-500/20 text-red-600'
            }`}
        >
          <div className={`w-2 h-2 rounded-full ${healthStatus === 'success' ? 'bg-emerald-500 animate-pulse' :
              healthStatus === 'pending' ? 'bg-amber-500 animate-bounce' :
                'bg-red-500'
            }`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {healthStatus === 'success' ? 'Backend Online' :
              healthStatus === 'pending' ? 'Connecting...' :
                'Backend Offline'}
          </span>
        </motion.div>
      </div>

      {/* Hero Section - Pure Light Mode */}
      <header className="relative pt-24 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-10 text-center md:text-left z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 bg-brand-aquamarine/20 text-brand-black rounded-full text-xs font-black uppercase tracking-widest border border-brand-aquamarine/30"
            >
              🚀 AI-Powered Document Workflow
            </motion.div>
            <h1 className="text-7xl md:text-8xl font-black leading-[1.1] text-brand-black">
              Simple. Fast. <br />
              <span className="relative">
                <span className="relative z-10 text-brand-gold italic">Secure.</span>
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  className="absolute bottom-4 left-0 h-6 bg-brand-aquamarine/40 -z-10"
                />
              </span>
            </h1>
            <p className="text-2xl text-brand-black/60 max-w-xl leading-relaxed font-medium">
              The ultimate platform for electronic document management and business process automation in Kazakhstan.
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <Link
                to={isLoggedIn ? "/dashboard/organizations" : "/register"}
                className="bg-brand-black text-brand-eggshell px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-gold transition-colors shadow-2xl"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started Now"}
              </Link>
              <button className="bg-white text-brand-black border-2 border-brand-black/5 px-10 py-5 rounded-2xl font-black text-lg hover:border-brand-black transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1 relative"
          >
            <div className="relative w-full aspect-square bg-white rounded-[60px] shadow-2xl border border-brand-black/5 p-10 overflow-hidden group">
              {/* Abstract Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-aquamarine/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-brand-gold/20 transition-colors" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -ml-20 -mb-20" />

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="relative z-10 bg-brand-eggshell p-8 rounded-[40px] shadow-inner border border-brand-black/5 h-full flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b border-brand-black/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-brand-black/20 tracking-widest">Document Analysis</div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="h-4 w-3/4 bg-white rounded-full shadow-sm" />
                  <div className="h-4 w-full bg-white rounded-full shadow-sm" />
                  <div className="h-4 w-5/6 bg-white rounded-full shadow-sm" />
                </div>
                <div className="mt-auto p-6 bg-white rounded-3xl shadow-lg border border-brand-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-aquamarine rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-brand-black" size={20} />
                    </div>
                    <span className="font-black text-sm">Verified Grounding</span>
                  </div>
                  <div className="text-xs font-bold text-brand-aquamarine">100% Secure</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Grid - Clean White */}
      <section className="bg-white py-40 px-8 relative z-20 shadow-[0_-50px_100px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-32 space-y-6"
          >
            <h2 className="text-6xl font-black text-brand-black">Simple solutions for any business</h2>
            <p className="text-brand-black/40 text-xl max-w-2xl mx-auto font-medium">
              We provide the tools you need to digitize your entire legal workflow while staying compliant.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<FileText className="text-brand-black" size={32} />}
              title="AI Wizard"
              description="Generate agreements, NDAs, and invoices in seconds with verified grounding."
              delay={0.1}
            />
            <FeatureCard
              icon={<ShieldCheck className="text-brand-black" size={32} />}
              title="Clause Library"
              description="A central repository of pre-approved legal clauses with risk tagging."
              delay={0.2}
            />
            <FeatureCard
              icon={<History className="text-brand-black" size={32} />}
              title="Smart Versioning"
              description="Track every change with full history and parent-child document relationships."
              delay={0.3}
            />
            <FeatureCard
              icon={<Users className="text-brand-black" size={32} />}
              title="Multi-Entity"
              description="Manage multiple companies, branches, and profiles under one roof."
              delay={0.4}
            />
            <FeatureCard
              icon={<Zap className="text-brand-black" size={32} />}
              title="NCA Layer"
              description="Full support for Kazakhstan electronic digital signatures (EDS/ЭЦП)."
              delay={0.5}
            />
            <FeatureCard
              icon={<CheckCircle2 className="text-brand-black" size={32} />}
              title="Verified Grounding"
              description="AI that cites its sources directly from your internal legal library."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Sliding Highlight - Left to Right */}
      <section className="py-40 px-8 bg-brand-eggshell relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white p-14 rounded-[50px] shadow-2xl border border-brand-black/5">
              <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-brand-gold/20">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-4xl font-black mb-6 text-brand-black">NCA Layer Integration</h3>
              <p className="text-xl mb-10 text-brand-black/50 leading-relaxed font-medium">
                Verify and sign documents using official Kazakhstan standards.
                Our connection checker ensures your NCA Layer is active and ready.
              </p>
              <button className="bg-brand-black text-brand-eggshell px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-brand-gold transition-all shadow-xl">
                Check Connection <ArrowRight size={24} />
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-10"
          >
            <h2 className="text-6xl font-black text-brand-black leading-tight">Secure. <br />Compliant. <br /><span className="text-brand-aquamarine italic">Local.</span></h2>
            <div className="space-y-6">
              {['Official EDS support', 'BIN/IIN Verification', 'Bank details automation'].map((item, i) => (
                <div key={i} className="flex items-center gap-5 text-2xl font-black text-brand-black/80">
                  <div className="w-10 h-10 bg-brand-aquamarine/20 rounded-full flex items-center justify-center border border-brand-aquamarine/30">
                    <CheckCircle2 className="text-brand-aquamarine" size={24} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Light Mode */}
      <footer className="bg-white py-24 px-8 border-t border-brand-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-aquamarine flex items-center justify-center rounded-xl">
                <span className="text-brand-black font-black text-2xl">Q</span>
              </div>
              <span className="text-2xl font-black text-brand-black">QazDocs</span>
            </div>
            <div className="flex gap-12">
              <Link to="/products" className="text-sm font-black text-brand-black/40 hover:text-brand-black transition-colors">Products</Link>
              <Link to="/pricing" className="text-sm font-black text-brand-black/40 hover:text-brand-black transition-colors">Pricing</Link>
              <Link to="/about" className="text-sm font-black text-brand-black/40 hover:text-brand-black transition-colors">About</Link>
            </div>
            <p className="text-sm font-black text-brand-black/20 italic">© 2026 QazDocs</p>
          </div>
          <div className="pt-12 border-t border-brand-black/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/10">Made for Kazakhstan • Powered by AI Intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-3xl border border-brand-black/5 hover:shadow-xl transition-all cursor-default group"
  >
    <div className="mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-brand-black/50 leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
