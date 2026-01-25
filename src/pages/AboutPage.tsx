import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-brand-black pt-24 pb-32">
      <section className="px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-24 items-center mb-40">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-10"
          >
            <h1 className="text-8xl font-black italic">We are <br /><span className="text-brand-gold italic leading-none">QazDocs.</span></h1>
            <p className="text-2xl text-brand-black/50 font-medium leading-relaxed">
              Founded in Almaty, we're on a mission to modernize Kazakhstan's legal landscape through the power of grounded AI.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full aspect-video bg-brand-eggshell rounded-[60px] border border-brand-black/5 flex items-center justify-center p-12 text-6xl font-black text-brand-black/5 italic"
          >
            EST. 2026
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-24">
          <div className="space-y-8">
            <h2 className="text-5xl font-black">Our Philosophy</h2>
            <p className="text-xl text-brand-black/60 font-medium leading-relaxed">
              We believe that legal technology should be more than just digital storage. It should be an active participant in your business growth. By combining local compliance expertise with cutting-edge Large Language Models, we build tools that are both powerful and safe.
            </p>
          </div>
          <div className="space-y-12">
            <div className="p-10 bg-brand-aquamarine/10 rounded-[40px] border border-brand-aquamarine/20">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-widest text-brand-black">Grounded AI</h3>
              <p className="font-bold text-brand-black/40">Our systems only use verified legal knowledge from your internal library, eliminating the risk of hallucination common in generic AI.</p>
            </div>
            <div className="p-10 bg-brand-gold/5 rounded-[40px] border border-brand-gold/10">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-widest text-brand-black">Local First</h3>
              <p className="font-bold text-brand-black/40">Built specifically for the Kazakhstan market, with native support for BIN/IIN, IBAN, and official NCA Layer standards.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
