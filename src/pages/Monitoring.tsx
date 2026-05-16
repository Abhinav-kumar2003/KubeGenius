import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { generateTimeSeries, alerts } from '@/data/mockData';

const latencyData = generateTimeSeries(30, 45, 20);
const requestData = [
  { time: '08:00', requests: 1200, errors: 12 },
  { time: '08:15', requests: 1580, errors: 8 },
  { time: '08:30', requests: 2100, errors: 15 },
  { time: '08:45', requests: 2450, errors: 22 },
  { time: '09:00', requests: 3200, errors: 18 },
  { time: '09:15', requests: 2800, errors: 10 },
  { time: '09:30', requests: 3600, errors: 25 },
];

export default function Monitoring() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Monitoring</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Real-time metrics and alerting</p>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-white/70">Response Latency (p95)</h3>
            <Activity className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} unit="ms" />
                <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-white/70">Request Rate & Errors</h3>
            <Activity className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="requests" fill="#3B82F6" radius={[2, 2, 0, 0]} name="Requests/min" />
                <Bar dataKey="errors" fill="#EF4444" radius={[2, 2, 0, 0]} name="Errors/min" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Alerts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="metric-card rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium text-white/70">Active Alerts</h3>
          <div className="flex items-center gap-2">
            {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  filter === f ? 'bg-blue-500/15 text-blue-400' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Severity', 'Alert', 'Source', 'Namespace', 'Pod', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredAlerts.map((alert, i) => (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2.5 pr-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      alert.severity === 'critical' ? 'bg-red-400/10 text-red-400' :
                      alert.severity === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-blue-400/10 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div>
                      <span className="text-[12px] text-white/70">{alert.title}</span>
                      <p className="text-[11px] text-white/30 truncate max-w-[250px]">{alert.message}</p>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{alert.source}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{alert.namespace}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/30 truncate max-w-[150px] block">{alert.pod || '-'}</span></td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-[11px] ${alert.status === 'firing' ? 'text-red-400' : 'text-green-400'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[10px] font-mono text-white/20">{new Date(alert.timestamp).toLocaleTimeString()}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
