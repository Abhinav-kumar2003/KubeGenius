import { motion } from 'framer-motion';
import { Lock, Key, Users, CheckCircle } from 'lucide-react';

const rbacData = [
  { subject: 'admin-group', type: 'Group', role: 'cluster-admin', namespace: 'All', resources: '*', verbs: '*', status: 'Active' },
  { subject: 'dev-group', type: 'Group', role: 'edit', namespace: 'app-frontend, app-backend', resources: 'deployments, pods, services', verbs: 'create, get, list, watch, update, patch', status: 'Active' },
  { subject: 'ml-group', type: 'Group', role: 'edit', namespace: 'app-ml', resources: 'deployments, pods, jobs', verbs: 'create, get, list, watch', status: 'Active' },
  { subject: 'viewer-group', type: 'Group', role: 'view', namespace: 'All', resources: '*', verbs: 'get, list, watch', status: 'Active' },
  { subject: 'autoscaler-sa', type: 'ServiceAccount', role: 'autoscaler', namespace: 'kube-system', resources: 'deployments, pods, hpa', verbs: 'get, list, watch, update, patch', status: 'Active' },
];

const secrets = [
  { name: 'db-credentials', namespace: 'app-backend', type: 'Opaque', keys: 2, age: '45d' },
  { name: 'api-keys', namespace: 'app-backend', type: 'Opaque', keys: 3, age: '30d' },
  { name: 'tls-cert', namespace: 'ingress-nginx', type: 'kubernetes.io/tls', keys: 2, age: '60d' },
  { name: 'ml-model-config', namespace: 'app-ml', type: 'Opaque', keys: 5, age: '15d' },
  { name: 'docker-registry', namespace: 'kube-system', type: 'kubernetes.io/dockerconfigjson', keys: 1, age: '90d' },
];

export default function Security() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Security</h1>
        <p className="text-[13px] text-white/40 mt-0.5">RBAC policies and secrets management</p>
      </motion.div>

      {/* RBAC Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-blue-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">RBAC Policies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Subject', 'Type', 'Role', 'Namespace', 'Resources', 'Verbs', 'Status'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {rbacData.map((rbac, i) => (
                <motion.tr key={rbac.subject} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-4"><span className="text-[12px] text-white/70">{rbac.subject}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40">{rbac.type}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-blue-400/60">{rbac.role}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{rbac.namespace}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40 truncate max-w-[150px] block">{rbac.resources}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/30 truncate max-w-[150px] block">{rbac.verbs}</span></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-[11px] text-green-400">{rbac.status}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Secrets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="metric-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-amber-400/60" />
          <h3 className="text-[13px] font-medium text-white/70">Secrets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Namespace', 'Type', 'Keys', 'Age'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {secrets.map((secret, i) => (
                <motion.tr key={secret.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400/40" />
                      <span className="text-[12px] text-white/70">{secret.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/40">{secret.namespace}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/40">{secret.type}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-mono text-white/50">{secret.keys}</span></td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] text-white/20">{secret.age}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
