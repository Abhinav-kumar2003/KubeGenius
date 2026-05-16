import { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, Container, RotateCcw, TrendingUp, ChevronDown } from 'lucide-react';
import { deployments, pods } from '@/data/mockData';

export default function Workloads() {
  const [activeTab, setActiveTab] = useState<'deployments' | 'pods'>('deployments');
  const [expandedDeployment, setExpandedDeployment] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Workloads</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Manage deployments and pods</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
        {(['deployments', 'pods'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === tab ? 'bg-blue-500/15 text-blue-400' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'deployments' ? (
        <div className="space-y-3">
          {deployments.map((dep, i) => (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="metric-card rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Boxes className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-white/80">{dep.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30">{dep.namespace}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-white/30">{dep.image}</span>
                      <span className="text-[11px] text-white/20">{dep.age}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Replicas */}
                  <div className="text-center">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Replicas</div>
                    <div className="text-[18px] font-semibold font-mono text-white/80">{dep.ready}/{dep.replicas}</div>
                  </div>

                  {/* CPU */}
                  <div className="w-24">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/30">CPU</span>
                      <span className="font-mono" style={{ color: dep.cpu > 80 ? '#EF4444' : '#3B82F6' }}>{dep.cpu}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${dep.cpu}%`, backgroundColor: dep.cpu > 80 ? '#EF4444' : '#3B82F6' }} />
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="w-24">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/30">Memory</span>
                      <span className="font-mono" style={{ color: dep.memory > 80 ? '#EF4444' : '#10B981' }}>{dep.memory}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${dep.memory}%`, backgroundColor: dep.memory > 80 ? '#EF4444' : '#10B981' }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors" title="Restart">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors" title="Scale Up">
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedDeployment(expandedDeployment === dep.name ? null : dep.name)}
                      className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedDeployment === dep.name ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedDeployment === dep.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t border-white/[0.06]"
                >
                  <div className="grid grid-cols-4 gap-4 text-[11px]">
                    <div>
                      <span className="text-white/30 block mb-1">Image</span>
                      <span className="font-mono text-white/60">{dep.image}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block mb-1">Namespace</span>
                      <span className="text-white/60">{dep.namespace}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block mb-1">Status</span>
                      <span className="text-green-400">{dep.status}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block mb-1">Age</span>
                      <span className="text-white/60">{dep.age}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[11px] font-medium hover:bg-blue-500/20 transition-colors">Scale</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/50 text-[11px] font-medium hover:bg-white/[0.08] transition-colors">Rollback</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/50 text-[11px] font-medium hover:bg-white/[0.08] transition-colors">Edit YAML</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto metric-card rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Namespace', 'Status', 'Restarts', 'CPU', 'Memory', 'Node', 'Age'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {pods.map((pod, i) => (
                <motion.tr
                  key={pod.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Container className="w-3.5 h-3.5 text-blue-400/40" />
                      <span className="text-[12px] font-mono text-white/70 truncate max-w-[200px]">{pod.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="text-[11px] text-white/40">{pod.namespace}</span></td>
                  <td className="py-3 px-4"><span className="text-[11px] text-green-400">{pod.status}</span></td>
                  <td className="py-3 px-4"><span className="text-[11px] font-mono text-white/50">{pod.restarts}</span></td>
                  <td className="py-3 px-4"><span className="text-[11px] font-mono text-blue-400/60">{pod.cpu}</span></td>
                  <td className="py-3 px-4"><span className="text-[11px] font-mono text-green-400/60">{pod.memory}</span></td>
                  <td className="py-3 px-4"><span className="text-[11px] font-mono text-white/40">{pod.node}</span></td>
                  <td className="py-3 px-4"><span className="text-[11px] text-white/30">{pod.age}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
