import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Zap, 
  FileSearch,
  ArrowRight
} from 'lucide-react';

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-brand-eggshell text-brand-black pt-24">
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24 space-y-6"
        >
          <h1 className="text-7xl font-black italic">Our Products</h1>
          <p className="text-xl text-brand-black/60 max-w-2xl mx-auto font-medium">
            Advanced legal technology modules designed to work together or as standalone solutions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <ProductCard 
            icon={<Cpu size={40} className="text-brand-gold" />}
            title="QazDocs AI Wizard"
            description="The flagship AI engine that generates grounded legal documents with zero hallucinations. Uses real-time RAG against your private clause library."
            features={['Verified Citations', 'Risk Scoring', 'Multi-format Export']}
          />
          <ProductCard 
            icon={<Layers size={40} className="text-brand-aquamarine" />}
            title="Clause Repository"
            description="A secure, shared library for your firm's most important legal language. Centralize knowledge and ensure consistency across all departments."
            features={['Version Control', 'Permission Management', 'Global Search']}
          />
          <ProductCard 
            icon={<ShieldCheck size={40} className="text-brand-gold" />}
            title="Compliance Engine"
            description="Automatically verify BIN/IIN, bank details, and signatory authority against official Kazakhstan registries."
            features={['Official Registry Sync', 'Automated KYC', 'Error Detection']}
          />
          <ProductCard 
            icon={<Zap size={40} className="text-brand-aquamarine" />}
            title="E-Sign Connect"
            description="The most reliable NCA Layer integration for EDS/ЭЦП signing. Built specifically for high-volume corporate document flows."
            features={['NCA Layer Native', 'Batch Signing', 'Audit Logs']}
          />
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ icon, title, description, features }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    className="bg-white p-12 rounded-[40px] border border-brand-black/5 shadow-xl hover:shadow-2xl transition-all group"
  >
    <div className="mb-8 p-4 bg-brand-eggshell inline-block rounded-2xl group-hover:rotate-6 transition-transform">
      {icon}
    </div>
    <h2 className="text-4xl font-black mb-6">{title}</h2>
    <p className="text-lg text-brand-black/60 mb-8 font-medium leading-relaxed">
      {description}
    </p>
    <ul className="space-y-3 mb-10">
      {features.map((f: string) => (
        <li key={f} className="flex items-center gap-3 font-black text-sm uppercase tracking-wider text-brand-black/80">
          <div className="w-2 h-2 bg-brand-aquamarine rounded-full" />
          {f}
        </li>
      ))}
    </ul>
    <button className="flex items-center gap-2 font-black text-brand-gold group-hover:gap-4 transition-all uppercase text-xs tracking-[0.2em]">
      Learn More <ArrowRight size={16} />
    </button>
  </motion.div>
);

export default ProductsPage;
