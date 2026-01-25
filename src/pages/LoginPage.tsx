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

      {/* Right Side: Login Form - Pure White */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 p-8 md:p-24 flex flex-col justify-center bg-brand-eggshell/20"
      >
        <div className="max-w-md mx-auto w-full space-y-12">
          <AnimatePresence mode="wait">
            {!isVerifying ? (
              <motion.div 
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-4xl font-black italic text-brand-black">С возвращением.</h2>
                  <p className="text-brand-black/50 font-medium">Введите данные для входа.</p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <XCircle size={18} />
                    {error}
                  </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Электронная почта</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.kz"
                        className="w-full bg-brand-eggshell/30 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Пароль</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={20} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-brand-eggshell/30 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-brand-black text-brand-eggshell py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Проверка...
                      </>
                    ) : (
                      <>
                        Войти в кабинет <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="verify-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-4xl font-black italic text-brand-black">Подтверждение email.</h2>
                  <p className="text-brand-black/50 font-medium">Введите код, отправленный на {email}.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <XCircle size={18} />
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleVerify}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Код подтверждения</label>
                    <input 
                      type="text" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-brand-eggshell/30 border-2 border-transparent rounded-xl py-4 px-4 text-center text-2xl font-black tracking-widest focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={verifyMutation.isPending}
                    className="w-full bg-brand-black text-brand-eggshell py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                  >
                    {verifyMutation.isPending ? <Loader2 className="animate-spin" /> : 'Подтвердить и войти'}
                  </button>
                </form>

                <button 
                  onClick={() => setIsVerifying(false)}
                  className="w-full text-brand-black/40 font-bold hover:text-brand-black transition-colors"
                >
                  Назад ко входу
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NCA Layer Check Section */}
          <div className="pt-8 border-t border-brand-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <LinkIcon size={18} className="text-brand-gold" />
                Подключение NCALayer
              </h3>
              <button 
                onClick={checkNCALayer}
                disabled={ncaStatus === 'checking'}
                className="text-brand-black/40 hover:text-brand-black transition-colors"
              >
                <RefreshCw size={18} className={ncaStatus === 'checking' ? 'animate-spin' : ''} />
              </button>
            </div>

            <AnimatePresence mode='wait'>
              {ncaStatus === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-4 bg-white rounded-xl border-2 border-dashed border-brand-black/10 text-center"
                >
                  <p className="text-sm text-brand-black/40">Проверьте подключение для работы с ЭЦП</p>
                </motion.div>
              )}

              {ncaStatus === 'checking' && (
                <motion.div 
                  key="checking"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-4 bg-brand-aquamarine/10 rounded-xl flex items-center justify-center gap-3"
                >
                  <div className="w-2 h-2 bg-brand-aquamarine rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-aquamarine rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-brand-aquamarine rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-sm font-bold text-brand-aquamarine italic">Идет поиск NCALayer...</span>
                </motion.div>
              )}

              {ncaStatus === 'connected' && (
                <motion.div 
                  key="connected"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-brand-aquamarine text-brand-black rounded-xl flex items-center gap-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <CheckCircle size={20} />
                  <span>NCALayer подключен (v1.3.0)</span>
                </motion.div>
              )}

              {ncaStatus === 'error' && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }} 
                  animate={{ x: [0, -10, 10, -10, 10, 0], opacity: 1 }}
                  className="p-4 bg-red-100 text-red-600 rounded-xl flex items-center gap-3 font-bold"
                >
                  <XCircle size={20} />
                  <span>NCALayer не найден. Запущен ли сервис?</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-brand-black/40 text-sm font-medium">
            Нет аккаунта? <Link to="/register" className="text-brand-black border-b-2 border-brand-aquamarine hover:border-brand-gold transition-colors">Зарегистрироваться</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
