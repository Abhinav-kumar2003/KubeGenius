import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { costData } from '@/data/mockData';

const costBreakdown = [
  { name: 'Compute', value: 142, color: '#3B82F6' },
  { name: 'Storage', value: 34, color: '#10B981' },
  { name: 'Network', value: 18, color: '#F59E0B' },
  { name: 'ML/AI', value: 56, color: '#8B5CF6' },
];

export default function Cost() {
  const totalDaily = costBreakdown.reduce((s, c) => s + c.value, 0);
  const totalMonthly = totalDaily * 30;
  const savings = costData.idleResources.reduce((s, r) => s + r.monthlyWaste, 0);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Cost Analytics</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Cloud cost optimization and resource efficiency</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Daily Cost', value: `$${totalDaily}`, change: '+12%', icon: DollarSign, color: 'text-blue-400' },
          { label: 'Monthly Estimate', value: `$${(totalMonthly / 1000).toFixed(1)}k`, change: '+8%', icon: DollarSign, color: 'text-purple-400' },
          { label: 'Potential Savings', value: `$${savings}/mo`, change: '-15%', icon: TrendingDown, color: 'text-green-400' },
          { label: 'Idle Resources', value: `${costData.idleResources.length}`, change: '-2', icon: AlertTriangle, color: 'text-amber-400' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="metric-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-[22px] font-semibold text-white/80">{m.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Cost Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 metric-card rounded-xl p-5"
        >
          <h3 className="text-[13px] font-medium text-white/70 mb-4">Weekly Cost Breakdown</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} unit="$" />
                <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="compute" stackId="cost" fill="#3B82F6" radius={[0, 0, 0, 0]} name="Compute" />
                <Bar dataKey="storage" stackId="cost" fill="#10B981" radius={[0, 0, 0, 0]} name="Storage" />
                <Bar dataKey="network" stackId="cost" fill="#F59E0B" radius={[0, 0, 0, 0]} name="Network" />
                <Bar dataKey="ml" stackId="cost" fill="#8B5CF6" radius={[2, 2, 0, 0]} name="ML/AI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cost Breakdown Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card rounded-xl p-5"
        >
          <h3 className="text-[13px] font-medium text-white/70 mb-4">Cost Distribution</h3>
          <div className="flex items-center justify-center h-[200px]">
            <PieChart width={200} height={200}>
              <Pie data={costBreakdown} cx={100} cy={100} innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/50">{item.name}</span>
                </div>
                <span className="text-white/80 font-mono">${item.value}/day</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Idle Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="metric-card rounded-xl p-5"
      >
        <h3 className="text-[13px] font-medium text-white/70 mb-4">Optimization Recommendations</h3>
        <div className="space-y-3">
          {costData.idleResources.map((res) => (
            <div key={res.name} className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.03]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-white/70">{res.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30">{res.type}</span>
                </div>
                <p className="text-[11px] text-white/40 mt-0.5">{res.recommendation}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[14px] font-semibold text-amber-400 font-mono">${res.monthlyWaste}/mo</div>
                <div className="text-[10px] text-white/20">potential savings</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[11px] font-medium hover:bg-green-500/20 transition-colors shrink-0">
                Apply
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
