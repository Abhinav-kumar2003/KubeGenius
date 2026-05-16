import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, Eye, EyeOff, ArrowRight, Github, Globe } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

type View = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const [view, setView] = useState<View>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (view === 'login') {
      if (!email || !password) { setError('Please fill in all fields'); return; }
      const success = await login(email, password);
      if (success) navigate('/');
    } else {
      if (!name || !email || !password) { setError('Please fill in all fields'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      const success = await register(name, email, password);
      if (success) navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E14] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-[18px] font-semibold text-white/90">KubeGenius</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-[32px] font-semibold text-white/90 leading-tight">
              AI-Powered<br />Kubernetes<br />
              <span className="text-gradient">Autoscaling</span>
            </h2>
            <p className="text-[14px] text-white/40 max-w-[360px] leading-relaxed">
              Predict traffic spikes with machine learning, proactively scale workloads,
              and optimize cloud costs — all from one intelligent platform.
            </p>
            <div className="flex gap-6 pt-4">
              <div>
                <div className="text-[24px] font-semibold text-white/80">94%</div>
                <div className="text-[11px] text-white/30">Prediction Accuracy</div>
              </div>
              <div>
                <div className="text-[24px] font-semibold text-white/80">3.2x</div>
                <div className="text-[11px] text-white/30">Faster Scaling</div>
              </div>
              <div>
                <div className="text-[24px] font-semibold text-white/80">40%</div>
                <div className="text-[11px] text-white/30">Cost Reduction</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-white/20">Enterprise Edition v3.1.0</div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-[18px] font-semibold text-white/90">KubeGenius</span>
          </div>

          <h2 className="text-[22px] font-semibold text-white/90 mb-1">
            {view === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-[13px] text-white/40 mb-6">
            {view === 'login' ? 'Sign in to your account' : 'Get started with KubeGenius'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="text-[11px] text-white/30 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] text-white/30 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-4 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/30 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 px-4 pr-10 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-400">{error}</motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] text-white/20 bg-[#0C0E14]">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/60 hover:bg-white/[0.06] flex items-center justify-center gap-2 transition-all">
              <Github className="w-4 h-4" />
              Continue with GitHub
            </button>
            <button className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/60 hover:bg-white/[0.06] flex items-center justify-center gap-2 transition-all">
              <Globe className="w-4 h-4" />
              Continue with Google
            </button>
          </div>

          <p className="text-center text-[12px] text-white/30 mt-6">
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {view === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
