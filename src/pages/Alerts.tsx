import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, Edit3, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  duration: string;
  severity: 'critical' | 'warning' | 'info';
  channel: string;
  enabled: boolean;
}

const initialRules: AlertRule[] = [
  { id: '1', name: 'High CPU Usage', condition: 'cpu_usage > 80%', threshold: '80%', duration: '5m', severity: 'critical', channel: 'Slack', enabled: true },
  { id: '2', name: 'Memory Pressure', condition: 'memory_usage > 85%', threshold: '85%', duration: '5m', severity: 'warning', channel: 'Email', enabled: true },
  { id: '3', name: 'Pod Crash Loop', condition: 'restart_count > 3', threshold: '3', duration: '10m', severity: 'critical', channel: 'Slack + Email', enabled: true },
  { id: '4', name: 'AI Prediction Alert', condition: 'predicted_cpu > 75%', threshold: '75%', duration: '2m', severity: 'warning', channel: 'Slack', enabled: true },
  { id: '5', name: 'Disk Pressure', condition: 'disk_usage > 70%', threshold: '70%', duration: '15m', severity: 'warning', channel: 'Email', enabled: false },
  { id: '6', name: 'Node Not Ready', condition: 'node_status != Ready', threshold: '-', duration: '1m', severity: 'critical', channel: 'Slack + Email + PagerDuty', enabled: true },
];

export default function Alerts() {
  const [rules, setRules] = useState<AlertRule[]>(initialRules);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({ severity: 'warning', channel: 'Slack', enabled: true });

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const addRule = () => {
    if (!newRule.name || !newRule.condition) return;
    setRules([...rules, { ...newRule as AlertRule, id: Math.random().toString(36).substring(7) }]);
    setShowAdd(false);
    setNewRule({ severity: 'warning', channel: 'Slack', enabled: true });
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Alert Management</h1>
          <p className="text-[13px] text-white/40 mt-0.5">Configure alerting rules and channels</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[12px] font-medium hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: rules.length, icon: Bell, color: 'text-blue-400' },
          { label: 'Active', value: rules.filter(r => r.enabled).length, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Critical', value: rules.filter(r => r.severity === 'critical').length, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Warning', value: rules.filter(r => r.severity === 'warning').length, icon: AlertTriangle, color: 'text-amber-400' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card rounded-xl p-4 text-center">
            <s.icon className={`w-4 h-4 mx-auto mb-2 ${s.color}`} />
            <div className="text-[20px] font-semibold text-white/80">{s.value}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Rules Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="metric-card rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Status', 'Name', 'Condition', 'Threshold', 'Duration', 'Severity', 'Channel', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {rules.map((rule, i) => (
                <motion.tr key={rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-4">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-blue-500' : 'bg-white/10'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${rule.enabled ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[12px] font-medium text-white/70">{rule.name}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{rule.condition}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{rule.threshold}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{rule.duration}</span></td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      rule.severity === 'critical' ? 'bg-red-400/10 text-red-400' :
                      rule.severity === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-blue-400/10 text-blue-400'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{rule.channel}</span></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Rule Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="metric-card rounded-xl p-6 w-[480px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-medium text-white/70">Add Alert Rule</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-white/30 block mb-1">Rule Name</label>
                <input value={newRule.name || ''} onChange={e => setNewRule({ ...newRule, name: e.target.value })} className="w-full h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50" placeholder="e.g. High Memory Usage" />
              </div>
              <div>
                <label className="text-[11px] text-white/30 block mb-1">Condition</label>
                <input value={newRule.condition || ''} onChange={e => setNewRule({ ...newRule, condition: e.target.value })} className="w-full h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50" placeholder="e.g. memory_usage > 85%" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/30 block mb-1">Severity</label>
                  <select value={newRule.severity} onChange={e => setNewRule({ ...newRule, severity: e.target.value as AlertRule['severity'] })} className="w-full h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50">
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 block mb-1">Channel</label>
                  <select value={newRule.channel} onChange={e => setNewRule({ ...newRule, channel: e.target.value })} className="w-full h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50">
                    <option>Slack</option>
                    <option>Email</option>
                    <option>Slack + Email</option>
                    <option>PagerDuty</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-[11px] text-white/40 hover:text-white/60">Cancel</button>
                <button onClick={addRule} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-[11px] font-medium hover:bg-blue-600">Add Rule</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
