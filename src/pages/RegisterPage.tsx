import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Phone,
  Scale,
  User,
  ChevronRight, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../lib/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const roleOptions = [
    {
      id: 'user',
      title: 'Обычный пользователь',
      description: 'Работает с документами и подключает организацию.',
      icon: User,
    },
    {
      id: 'legal',
      title: 'Свободный юрист',
      description: 'Проверяет, комментирует и согласует документы.',
      icon: Scale,
    },
  ];

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setIsRegistered(true);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      navigate({ to: '/login' });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Invalid verification code.');
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ email, phone, password, role });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyMutation.mutate({ email, code: verificationCode });
  };

  return (
    <div className="min-h-screen bg-brand-eggshell flex flex-col md:flex-row font-sans pt-20">
      {/* Left Side: Branding & Info */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-[1.5] bg-white p-12 flex-col justify-between border-r border-brand-black/5"
      >
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="text-brand-gold group-hover:-translate-x-1 transition-transform" />
          <span className="text-brand-black/60 font-black uppercase text-xs tracking-widest">Back to Home</span>
        </Link>

        <div className="space-y-8">
          <div className="w-16 h-16 bg-brand-aquamarine rounded-2xl flex items-center justify-center shadow-xl shadow-brand-aquamarine/20">
            <span className="text-brand-black font-black text-4xl">Q</span>
          </div>
          <h1 className="text-7xl font-black text-brand-black leading-[1.1]">
            Join the <br />
            <span className="text-brand-gold italic">Evolution.</span>
          </h1>
          <p className="text-brand-black/40 text-xl max-w-md font-medium">
            Start automating your legal documents and workflows with intelligent AI.
          </p>
        </div>

        <div className="bg-brand-eggshell p-8 rounded-[32px] border border-brand-black/5 shadow-inner">
          <p className="text-brand-gold font-black text-[10px] mb-4 uppercase tracking-[0.2em]">Network Capability</p>
          <div className="flex items-center gap-4">
            <CheckCircle className="text-brand-aquamarine" />
            <span className="text-brand-black/60 text-sm font-bold">Secure NCA Layer Integration Ready</span>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Form */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 p-8 md:p-24 flex flex-col justify-center bg-brand-eggshell/20"
      >
        <div className="max-w-md mx-auto w-full space-y-12">
          <AnimatePresence mode="wait">
            {!isRegistered ? (
              <motion.div 
                key="register-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-4xl font-black italic text-brand-black">Create Account.</h2>
                  <p className="text-brand-black/50 font-medium">Join 500+ companies using QazDocs.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <XCircle size={18} />
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Роль</p>
                    <div role="radiogroup" aria-label="Registration role" className="space-y-3">
                      {roleOptions.map((option) => {
                        const isActive = role === option.id;
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setRole(option.id)}
                            className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                              isActive
                                ? 'border-brand-aquamarine bg-white shadow-xl shadow-brand-aquamarine/10'
                                : 'border-brand-black/10 bg-white/50 hover:border-brand-black/20 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                                  isActive
                                    ? 'bg-brand-aquamarine text-brand-black'
                                    : 'bg-brand-black/5 text-brand-black/60'
                                }`}
                              >
                                <Icon size={22} />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-base font-black text-brand-black">{option.title}</span>
                                  <span
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                      isActive ? 'text-brand-black' : 'text-brand-black/40'
                                    }`}
                                  >
                                    {isActive ? 'Выбрано' : 'Выбрать'}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-brand-black/50">{option.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Email Address</label>
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
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20 group-focus-within:text-brand-aquamarine transition-colors" size={20} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 (7XX) XXX-XX-XX"
                        className="w-full bg-brand-eggshell/30 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 focus:border-brand-aquamarine focus:bg-white focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Password</label>
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
                    disabled={registerMutation.isPending}
                    className="w-full bg-brand-black text-brand-eggshell py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Get Started <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-brand-black/40 text-sm font-medium">
                  Already have an account? <Link to="/login" className="text-brand-black border-b-2 border-brand-aquamarine hover:border-brand-gold transition-colors">Login</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="verify-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-4xl font-black italic text-brand-black">Verify Email.</h2>
                  <p className="text-brand-black/50 font-medium">We've sent a 6-digit code to {email}.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <XCircle size={18} />
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleVerify}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-black/40">Verification Code</label>
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
                    className="w-full bg-brand-black text-brand-eggshell py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-125 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <button 
                  onClick={() => setIsRegistered(false)}
                  className="w-full text-brand-black/40 font-bold hover:text-brand-black transition-colors"
                >
                  Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
