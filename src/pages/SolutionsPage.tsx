import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Scale, 
  Briefcase, 
  CheckCircle2,
  Globe
} from 'lucide-react';

const SolutionsPage = () => {
  return (
    <div className="min-h-screen bg-white text-brand-black pt-24">
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl mb-32 space-y-8"
        >
          <h1 className="text-8xl font-black leading-none">Built for <br /><span className="text-brand-aquamarine italic">Industry Leaders.</span></h1>
          <p className="text-2xl text-brand-black/50 font-medium">
            Tailored legal automation workflows for Kazakhstan's most demanding sectors.
          </p>
        </motion.div>

        <div className="space-y-32">
          <SolutionSection 
            title="For Large Enterprises"
            subtitle="Centralize control across thousands of documents and hundreds of entities."
            icon={<Building2 size={48} />}
            points={['Multi-branch management', 'Custom approval workflows', 'Full audit trails']}
            imageBg="bg-brand-eggshell"
          />
          <SolutionSection 
            title="For Law Firms"
            subtitle="Automate routine drafting and focus on high-value legal strategy."
            icon={<Scale size={48} />}
            points={['White-label client portals', 'Clause performance analytics', 'Bilingual template engine']}
            imageBg="bg-brand-aquamarine/10"
            reverse
          />
          <SolutionSection 
            title="For Startups & SMBs"
            subtitle="Professional legal protection without the professional price tag."
            icon={<Briefcase size={48} />}
            points={['Standardized HR agreements', 'Automated NDAs', 'Simple E-Sign integration']}
            imageBg="bg-brand-gold/5"
          />
        </div>
      </section>
    </div>
  );
};

const SolutionSection = ({ title, subtitle, icon, points, imageBg, reverse }: any) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-20`}>
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex-1 space-y-8"
    >
      <div className="w-20 h-20 bg-brand-black text-brand-eggshell rounded-3xl flex items-center justify-center shadow-2xl">
        {icon}
      </div>
      <h2 className="text-5xl font-black">{title}</h2>
      <p className="text-xl text-brand-black/60 font-medium leading-relaxed">{subtitle}</p>
      <div className="space-y-4">
        {points.map((p: string) => (
          <div key={p} className="flex items-center gap-4 text-lg font-bold">
            <CheckCircle2 className="text-brand-aquamarine" />
            {p}
          </div>
        ))}
      </div>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className={`flex-1 w-full aspect-square ${imageBg} rounded-[80px] border border-brand-black/5 flex items-center justify-center p-12`}
    >
      <div className="w-full h-full bg-white rounded-[60px] shadow-2xl flex items-center justify-center">
        <Globe size={120} className="text-brand-black/5 animate-pulse" />
      </div>
    </motion.div>
  </div>
);

export default SolutionsPage;
