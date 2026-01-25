import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-brand-eggshell text-brand-black pt-24 pb-32">
      <section className="px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24 space-y-6"
        >
          <h1 className="text-7xl font-black italic">Transparent Pricing.</h1>
          <p className="text-xl text-brand-black/60 font-medium max-w-xl mx-auto">
            Choose the plan that fits your organization's document volume and legal complexity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard 
            tier="Starter"
            price="0"
            description="Perfect for small businesses starting their digital transformation."
            features={['5 AI Generations/mo', 'Single Entity', 'Basic Clause Library', 'Standard E-Sign']}
          />
          <PricingCard 
            tier="Professional"
            price="49"
            description="Advanced tools for growing companies with high document volume."
            features={['50 AI Generations/mo', '3 Legal Entities', 'Advanced RAG Grounding', 'Batch EWS Signing', 'Priority Support']}
            highlighted
          />
          <PricingCard 
            tier="Enterprise"
            price="Custom"
            description="Full-scale automation for large organizations and law firms."
            features={['Unlimited Generations', 'Unlimited Entities', 'Custom AI Training', 'API Access', 'Dedicated Account Manager']}
          />
        </div>
      </section>
    </div>
  );
};

const PricingCard = ({ tier, price, description, features, highlighted }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    className={`p-10 rounded-[48px] border ${highlighted ? 'bg-brand-black text-white border-brand-black shadow-2xl' : 'bg-white border-brand-black/5 shadow-xl'} flex flex-col`}
  >
    <div className="mb-8">
      <h3 className={`text-2xl font-black mb-2 ${highlighted ? 'text-brand-aquamarine' : 'text-brand-black'}`}>{tier}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-black">${price}</span>
        {price !== 'Custom' && <span className={`text-sm font-bold ${highlighted ? 'text-white/40' : 'text-brand-black/40'}`}>/month</span>}
      </div>
      <p className={`text-sm font-medium ${highlighted ? 'text-white/60' : 'text-brand-black/50'}`}>{description}</p>
    </div>
    
    <div className="space-y-4 mb-12 flex-1">
      {features.map((f: string) => (
        <div key={f} className="flex items-center gap-3">
          <Check size={18} className={highlighted ? 'text-brand-aquamarine' : 'text-brand-gold'} />
          <span className="text-sm font-bold tracking-tight">{f}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${highlighted ? 'bg-brand-aquamarine text-brand-black hover:brightness-110' : 'bg-brand-black text-white hover:bg-brand-gold'}`}>
      Get Started
    </button>
  </motion.div>
);

export default PricingPage;
