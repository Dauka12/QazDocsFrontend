import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../lib/api';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [ncaStatus, setNcaStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      // Store token (simplified)
      localStorage.setItem('token', response.data.access_token);
      navigate({ to: '/dashboard' }); // Redirect to dashboard
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Не удалось войти. Проверьте данные.';
      setError(msg);
      if (msg.includes('email not verified')) {
        setIsVerifying(true);
      }
    }
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setIsVerifying(false);
      setError('');
      // Optionally auto-login or just show success
      loginMutation.mutate({ email, password });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Неверный код подтверждения.');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyMutation.mutate({ email, code: verificationCode });
  };

  const checkNCALayer = () => {
    setNcaStatus('checking');
    setTimeout(() => {
      setNcaStatus(Math.random() > 0.3 ? 'connected' : 'error');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-eggshell flex flex-col md:flex-row font-sans pt-20">
      {/* Left Side: Branding & Info - Light Mode */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-[1.5] bg-white p-12 flex-col justify-between border-r border-brand-black/5"
      >
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="text-brand-gold group-hover:-translate-x-1 transition-transform" />
          <span className="text-brand-black/60 font-black uppercase text-xs tracking-widest">На главную</span>
        </Link>

        <div className="space-y-8">
          <div className="w-16 h-16 bg-brand-aquamarine rounded-2xl flex items-center justify-center shadow-xl shadow-brand-aquamarine/20">
            <span className="text-brand-black font-black text-4xl">Q</span>
          </div>
          <h1 className="text-7xl font-black text-brand-black leading-[1.1]">
            Включайтесь <br />
            <span className="text-brand-gold italic">в Legal Flow.</span>
          </h1>
          <p className="text-brand-black/40 text-xl max-w-md font-medium">
            Доступ к интеллектуальным документам и автоматизированным юридическим процессам.
          </p>
        </div>

        <div className="bg-brand-eggshell p-8 rounded-[32px] border border-brand-black/5 shadow-inner">
          <p className="text-brand-gold font-black text-[10px] mb-4 uppercase tracking-[0.2em]">Статус рабочего пространства</p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-aquamarine flex items-center justify-center text-[10px] font-black">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-brand-black/60 text-sm font-bold">42 компании генерируют документы...</span>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Login Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4 md:p-12 flex items-center justify-center bg-brand-eggshell/30"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg bg-white p-8 md:p-12 rounded-[48px] shadow-[0_32px_64px_-12px_rgba(13,33,39,0.08)] border border-brand-black/[0.03] relative overflow-hidden"
        >
          {/* Subtle decorative gradient inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-aquamarine/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

          <div className="relative z-10 space-y-10">
            <AnimatePresence mode="wait">
              {!isVerifying ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="space-y-3 text-center md:text-left">
                    <h2 className="text-4xl font-black italic text-brand-black tracking-tight">С возвращением.</h2>
                    <p className="text-brand-black/40 font-medium">Введите данные для входа в систему.</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3"
                    >
                      <XCircle size={18} />
                      {error}
                    </motion.div>
                  )}

                  <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 ml-1">Электронная почта</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.kz"
                          className="w-full bg-brand-eggshell/20 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all placeholder:text-brand-black/20 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 ml-1">Пароль</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={20} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-brand-eggshell/20 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all placeholder:text-brand-black/20 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-brand-black text-brand-white py-5 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-black/90 transition-all shadow-[0_20px_40px_-12px_rgba(13,33,39,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group text-white"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Проверка...</span>
                        </>
                      ) : (
                        <>
                          <span>Войти в кабинет</span>
                          <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="verify-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="space-y-3 text-center md:text-left">
                    <h2 className="text-4xl font-black italic text-brand-black tracking-tight">Подтверждение.</h2>
                    <p className="text-brand-black/40 font-medium">Код отправлен на <span className="text-brand-black font-bold">{email}</span></p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                      <XCircle size={18} />
                      {error}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleVerify}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 ml-1">Код подтверждения</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full bg-brand-eggshell/20 border-2 border-transparent rounded-2xl py-5 px-4 text-center text-3xl font-black tracking-[0.5em] focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all placeholder:text-brand-black/10"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifyMutation.isPending}
                      className="w-full bg-brand-black text-white py-5 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-black/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                      {verifyMutation.isPending ? <Loader2 className="animate-spin" /> : 'Подтвердить и войти'}
                    </button>
                  </form>

                  <button
                    onClick={() => setIsVerifying(false)}
                    className="w-full text-brand-black/30 font-bold hover:text-brand-black transition-colors text-sm uppercase tracking-widest"
                  >
                    ← Назад ко входу
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NCA Layer Check Section */}
            <div className="pt-10 border-t border-brand-black/5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-brand-black/70 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                    <LinkIcon size={14} className="text-brand-gold" />
                  </div>
                  Подключение NCALayer
                </h3>
                <button
                  onClick={checkNCALayer}
                  disabled={ncaStatus === 'checking'}
                  className="p-2 hover:bg-brand-black/5 rounded-full transition-colors group"
                >
                  <RefreshCw size={18} className={`${ncaStatus === 'checking' ? 'animate-spin' : ''} text-brand-black/30 group-hover:text-brand-black transition-colors`} />
                </button>
              </div>

              <AnimatePresence mode='wait'>
                {ncaStatus === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="p-5 bg-brand-eggshell/10 rounded-2xl border-2 border-dashed border-brand-black/5 text-center group hover:border-brand-gold/20 transition-colors cursor-pointer"
                    onClick={checkNCALayer}
                  >
                    <p className="text-xs font-bold text-brand-black/30 uppercase tracking-widest">Проверить статус подключения</p>
                  </motion.div>
                )}

                {ncaStatus === 'checking' && (
                  <motion.div
                    key="checking"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="p-5 bg-brand-aquamarine/5 rounded-2xl flex items-center justify-center gap-3"
                  >
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-brand-aquamarine rounded-full animate-bounce [animation-duration:0.6s]" />
                      <div className="w-1.5 h-1.5 bg-brand-aquamarine rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-brand-aquamarine rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
                    </div>
                    <span className="text-sm font-bold text-brand-aquamarine italic uppercase tracking-wider">Инициализация...</span>
                  </motion.div>
                )}

                {ncaStatus === 'connected' && (
                  <motion.div
                    key="connected"
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="p-5 bg-brand-aquamarine text-brand-black rounded-2xl flex items-center justify-between font-bold shadow-[0_10px_30px_-5px_rgba(127,239,189,0.3)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center">
                        <CheckCircle size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-tight opacity-60 font-black">NCALayer Active</span>
                        <span className="text-sm">Версия 1.3.0</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {ncaStatus === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ x: [0, -5, 5, -5, 5, 0], opacity: 1 }}
                    className="p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-bold border border-red-100"
                  >
                    <XCircle size={20} className="shrink-0" />
                    <span className="text-sm">Сервис NCALayer не обнаружен.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-brand-black/30 text-[13px] font-bold uppercase tracking-wider">
              Нет аккаунта? <Link to="/register" className="text-brand-black border-b-2 border-brand-aquamarine hover:border-brand-gold transition-all pb-0.5">Создать сейчас</Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
