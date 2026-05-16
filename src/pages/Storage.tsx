import { motion } from 'framer-motion';
import { Database, Layers } from 'lucide-react';

const storageData = [
  { name: 'postgres-data', namespace: 'app-backend', type: 'PersistentVolumeClaim', size: '50Gi', used: '32Gi', status: 'Bound', storageClass: 'gp3' },
  { name: 'redis-data', namespace: 'app-backend', type: 'PersistentVolumeClaim', size: '10Gi', used: '7.2Gi', status: 'Bound', storageClass: 'gp3' },
  { name: 'ml-models', namespace: 'app-ml', type: 'PersistentVolumeClaim', size: '100Gi', used: '64Gi', status: 'Bound', storageClass: 'io1' },
  { name: 'prometheus-tsdb', namespace: 'monitoring', type: 'PersistentVolumeClaim', size: '200Gi', used: '156Gi', status: 'Bound', storageClass: 'gp3' },
  { name: 'grafana-data', namespace: 'monitoring', type: 'PersistentVolumeClaim', size: '10Gi', used: '2.1Gi', status: 'Bound', storageClass: 'gp3' },
];

const pvData = [
  { name: 'pv-001', capacity: '500Gi', accessModes: 'RWO', reclaimPolicy: 'Retain', status: 'Bound', claim: 'app-backend/postgres-data', storageClass: 'gp3' },
  { name: 'pv-002', capacity: '100Gi', accessModes: 'RWO', reclaimPolicy: 'Retain', status: 'Bound', claim: 'app-backend/redis-data', storageClass: 'gp3' },
  { name: 'pv-003', capacity: '500Gi', accessModes: 'RWO', reclaimPolicy: 'Retain', status: 'Bound', claim: 'app-ml/ml-models', storageClass: 'io1' },
];

export default function Storage() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Storage</h1>
        <p className="text-[13px] text-white/40 mt-0.5">Persistent volumes and storage classes</p>
      </motion.div>

      {/* PVCs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-blue-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">Persistent Volume Claims</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Namespace', 'Type', 'Size', 'Used', 'Usage %', 'Status', 'Storage Class'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {storageData.map((pvc, i) => {
                const usedPercent = Math.round((parseFloat(pvc.used) / parseFloat(pvc.size)) * 100);
                return (
                  <motion.tr key={pvc.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-4"><span className="text-[12px] text-white/70">{pvc.name}</span></td>
                    <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{pvc.namespace}</span></td>
                    <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{pvc.type}</span></td>
                    <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{pvc.size}</span></td>
                    <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{pvc.used}</span></td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${usedPercent}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-white/50">{usedPercent}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4"><span className="text-[11px] text-green-400">{pvc.status}</span></td>
                    <td className="py-2.5 pr-4"><span className="text-[11px] text-white/30">{pvc.storageClass}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* PVs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-purple-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">Persistent Volumes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Capacity', 'Access Modes', 'Reclaim Policy', 'Status', 'Claim', 'Storage Class'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {pvData.map((pv, i) => (
                <motion.tr key={pv.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-4"><span className="text-[12px] text-white/70">{pv.name}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{pv.capacity}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{pv.accessModes}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{pv.reclaimPolicy}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-green-400">{pv.status}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/40">{pv.claim}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/30">{pv.storageClass}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
