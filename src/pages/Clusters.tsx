import { motion } from 'framer-motion';
import { Server, Cpu, MemoryStick, Container, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { clusters, nodes, generateTimeSeries } from '@/data/mockData';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function Clusters() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Kubernetes Clusters</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Manage and monitor all clusters</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-5">
        {clusters.map((cluster, i) => {
          const cpuHistory = generateTimeSeries(20, cluster.cpu, 8);
          return (
            <motion.div
              key={cluster.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="metric-card rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-white/80">{cluster.name}</h3>
                      <span className={`w-2 h-2 rounded-full ${cluster.status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-white/30" />
                      <span className="text-[11px] text-white/30">{cluster.provider} · {cluster.region}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] text-white/40 font-mono">v{cluster.version}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3 h-3 text-blue-400/60" />
                    <span className="text-[10px] text-white/30">CPU</span>
                  </div>
                  <span className="text-[18px] font-semibold font-mono" style={{ color: cluster.cpu > 80 ? '#EF4444' : '#3B82F6' }}>{cluster.cpu}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MemoryStick className="w-3 h-3 text-green-400/60" />
                    <span className="text-[10px] text-white/30">Memory</span>
                  </div>
                  <span className="text-[18px] font-semibold font-mono" style={{ color: cluster.memory > 80 ? '#EF4444' : '#10B981' }}>{cluster.memory}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Container className="w-3 h-3 text-purple-400/60" />
                    <span className="text-[10px] text-white/30">Nodes</span>
                  </div>
                  <span className="text-[18px] font-semibold font-mono text-purple-400">{cluster.nodes}</span>
                </div>
              </div>

              <div className="h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuHistory}>
                    <defs>
                      <linearGradient id={`cpuGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={1.5} fill={`url(#cpuGrad-${i})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Nodes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="metric-card rounded-xl p-5"
      >
        <h3 className="text-[13px] font-medium text-white/70 mb-4">Node Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Role', 'Status', 'CPU', 'Memory', 'Pods', 'Disk', 'OS'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {nodes.map((node) => (
                <tr key={node.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      {node.status === 'Ready' ? <CheckCircle className="w-3.5 h-3.5 text-green-400/60" /> : <AlertTriangle className="w-3.5 h-3.5 text-yellow-400/60" />}
                      <span className="text-[12px] font-mono text-white/70">{node.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/50">{node.role}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-green-400">{node.status}</span></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${node.cpu}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-white/50">{node.cpu}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${node.memory}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-white/50">{node.memory}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{node.pods}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{node.disk}%</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{node.os}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
