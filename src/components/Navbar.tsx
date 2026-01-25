import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className="flex items-center justify-between px-8 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-brand-black/5 font-sans">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-aquamarine flex items-center justify-center rounded-xl shadow-sm">
            <span className="text-brand-black font-black text-2xl">Q</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-black">QazDocs</span>
        </Link>
      </motion.div>
      
      <div className="hidden md:flex items-center gap-10">
        <Link to="/products" className="text-sm font-bold text-brand-black/60 hover:text-brand-black transition-colors">
          Продукты
        </Link>
        <Link to="/solutions" className="text-sm font-bold text-brand-black/60 hover:text-brand-black transition-colors">
          Решения
        </Link>
        <Link to="/pricing" className="text-sm font-bold text-brand-black/60 hover:text-brand-black transition-colors">
          Тарифы
        </Link>
        <Link to="/about" className="text-sm font-bold text-brand-black/60 hover:text-brand-black transition-colors">
          О нас
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-6"
      >
        {isLoggedIn ? (
          <Link to="/dashboard" className="bg-brand-black text-brand-eggshell px-6 py-3 rounded-xl font-black text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm">
            Кабинет
          </Link>
        ) : (
          <>
            <Link to="/login" className="text-sm font-bold text-brand-black/60 hover:text-brand-black transition-colors">
              Войти
            </Link>
            <Link to="/register" className="bg-brand-aquamarine text-brand-black px-6 py-3 rounded-xl font-black text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm">
              Попробовать бесплатно
            </Link>
          </>
        )}
      </motion.div>
    </nav>
  );
};

export default Navbar;
