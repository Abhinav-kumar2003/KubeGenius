import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

export default function Login() {
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-[18px] font-semibold text-white/90">KubeGenius</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] flex justify-center"
        >
          <SignIn
            routing="virtual"
            forceRedirectUrl="/"
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#3B82F6', // Tailwind blue-500
                colorBackground: '#13161F', // Cohesive card background
                colorText: '#F3F4F6',
                colorInputBackground: '#1E2330',
                colorInputText: '#FFFFFF',
                borderRadius: '0.75rem',
              },
              elements: {
                card: 'border border-white/[0.06] shadow-2xl bg-[#13161F]/80 backdrop-blur-xl w-full',
                headerTitle: 'text-[20px] font-semibold text-white',
                headerSubtitle: 'text-[12px] text-white/40',
                socialButtonsBlockButton: 'bg-white/[0.02] border-white/[0.06] text-white/70 hover:bg-white/[0.05] transition-all hover:text-white',
                socialButtonsBlockButtonText: 'font-normal text-[12px]',
                formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white font-medium text-[13px] h-10 transition-all rounded-lg',
                formFieldInput: 'bg-white/[0.03] border-white/[0.06] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all h-10 rounded-lg text-[13px]',
                formFieldLabel: 'text-[11px] text-white/40 font-medium',
                footerActionLink: 'text-blue-400 hover:text-blue-300 font-medium text-[12px]',
                dividerText: 'text-[10px] text-white/20 uppercase tracking-wider',
                dividerLine: 'bg-white/[0.06]',
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
