import { motion } from 'framer-motion';
import { Network, ExternalLink, Copy } from 'lucide-react';
import { services } from '@/data/mockData';

export default function Services() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Services</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Kubernetes services and networking</p>
      </motion.div>

      <div className="metric-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Name', 'Namespace', 'Type', 'Cluster IP', 'External IP', 'Ports', 'Selector', 'Age'].map((h) => (
                <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {services.map((svc, i) => (
              <motion.tr
                key={svc.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-3.5 h-3.5 text-blue-400/40" />
                    <span className="text-[12px] font-medium text-white/70">{svc.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4"><span className="text-[11px] text-white/40">{svc.namespace}</span></td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    svc.type === 'LoadBalancer' ? 'bg-blue-400/10 text-blue-400' : 'bg-white/[0.05] text-white/40'
                  }`}>
                    {svc.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono text-white/50">{svc.clusterIP}</span>
                    <button className="text-white/20 hover:text-white/40 transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {svc.externalIP ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-mono text-green-400/60">{svc.externalIP}</span>
                      <ExternalLink className="w-3 h-3 text-white/20" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-white/20">-</span>
                  )}
                </td>
                <td className="py-3 px-4"><span className="text-[11px] font-mono text-white/40">{svc.ports}</span></td>
                <td className="py-3 px-4"><span className="text-[11px] text-white/40">{svc.selector}</span></td>
                <td className="py-3 px-4"><span className="text-[11px] text-white/20">{svc.age}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
