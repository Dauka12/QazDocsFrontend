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
          <h1 className="text-7xl font-black italic">Прозрачные тарифы.</h1>
          <p className="text-xl text-brand-black/60 font-medium max-w-xl mx-auto">
            Выберите план под объем документов и уровень юридической сложности.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard 
            tier="Старт"
            price="0"
            description="Подходит для малого бизнеса на старте цифровизации."
            features={['5 генераций ИИ/мес', '1 юрлицо', 'Базовая библиотека', 'Стандартная ЭЦП']}
          />
          <PricingCard 
            tier="Профи"
            price="49"
            description="Продвинутые инструменты для растущих компаний."
            features={['50 генераций ИИ/мес', '3 юрлица', 'Улучшенный RAG', 'Пакетное подписание', 'Приоритетная поддержка']}
            highlighted
          />
          <PricingCard 
            tier="Корпоративный"
            price="Custom"
            description="Полная автоматизация для крупных организаций и юрфирм."
            features={['Безлимитные генерации', 'Безлимитные юрлица', 'Обучение ИИ', 'Доступ к API', 'Персональный менеджер']}
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
        <span className="text-5xl font-black">{price === 'Custom' ? 'Индивидуально' : `$${price}`}</span>
        {price !== 'Custom' && <span className={`text-sm font-bold ${highlighted ? 'text-white/40' : 'text-brand-black/40'}`}>/месяц</span>}
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
      Начать
    </button>
  </motion.div>
);

export default PricingPage;
