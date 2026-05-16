import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SIcon, Bell, BrainCircuit, Save } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';

export default function Settings() {
  const { timeRange, setTimeRange } = useDashboardStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Settings</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Configure platform settings</p>
      </motion.div>

      {/* General */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SIcon className="w-4 h-4 text-blue-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">General</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-white/30 block mb-1.5">Default Time Range</label>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50">
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-white/30 block mb-1.5">Refresh Interval</label>
            <select className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50">
              <option>5 seconds</option>
              <option>10 seconds</option>
              <option>30 seconds</option>
              <option>1 minute</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* AI Engine */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-4 h-4 text-purple-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">AI Prediction Engine</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[12px] text-white/70">Enable AI Predictions</span>
              <p className="text-[11px] text-white/30">Use LSTM model for traffic forecasting</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-blue-500 relative cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[12px] text-white/70">Auto-Scaling</span>
              <p className="text-[11px] text-white/30">Automatically apply AI scaling recommendations</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-blue-500 relative cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-white/30 block mb-1.5">Confidence Threshold</label>
            <input type="range" min="50" max="99" defaultValue="85" className="w-full accent-blue-500" />
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>50%</span>
              <span>85%</span>
              <span>99%</span>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-white/30 block mb-1.5">Prediction Window</label>
            <select className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-amber-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">Notifications</h3>
        </div>
        <div className="space-y-3">
          {['Slack Webhook', 'Email Notifications', 'PagerDuty Integration'].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-[12px] text-white/70">{item}</span>
              <div className="w-9 h-5 rounded-full bg-white/10 relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 left-0.5" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-medium transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </motion.div>
    </div>
  );
}
