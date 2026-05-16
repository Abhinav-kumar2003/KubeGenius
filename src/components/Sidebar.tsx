import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Server,
  Boxes,
  Network,
  BrainCircuit,
  Globe,
  HardDrive,
  Activity,
  DollarSign,
  Bell,
  Settings,
  Shield,
  Cpu,
} from 'lucide-react';
import { useUIStore } from '@/lib/store';

const navItems = [
  { icon: LayoutGrid, label: 'Overview', path: '/' },
  { icon: Server, label: 'Clusters', path: '/clusters' },
  { icon: Boxes, label: 'Workloads', path: '/workloads' },
  { icon: BrainCircuit, label: 'AI Predictions', path: '/predictions' },
  { icon: Activity, label: 'Monitoring', path: '/monitoring' },
  { icon: DollarSign, label: 'Cost', path: '/cost' },
  { icon: Network, label: 'Services', path: '/services' },
  { icon: HardDrive, label: 'Storage', path: '/storage' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: Shield, label: 'Security', path: '/security' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 bg-[#0C0E14] border-r border-white/[0.06] flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.06]">
        <motion.div
          animate={{ scale: collapsed ? 0.9 : 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-[15px] text-white/90 tracking-tight whitespace-nowrap"
            >
              KubeGenius
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1d2a] text-white/80 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/[0.08]">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom toggle */}
      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={() => useUIStore.getState().toggleSidebar()}
          className="w-full flex items-center justify-center p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
        >
          <Globe className="w-4 h-4" />
        </button>
      </div>
    </motion.aside>
  );
}
