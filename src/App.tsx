import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TerminalPanel from '@/components/TerminalPanel';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clusters from '@/pages/Clusters';
import Workloads from '@/pages/Workloads';
import Predictions from '@/pages/Predictions';
import Monitoring from '@/pages/Monitoring';
import Cost from '@/pages/Cost';
import Services from '@/pages/Services';
import Storage from '@/pages/Storage';
import Alerts from '@/pages/Alerts';
import Security from '@/pages/Security';
import Settings from '@/pages/Settings';
import { useAuthStore, useUIStore } from '@/lib/store';

function Layout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#0C0E14]">
      <Sidebar />
      <Header />
      <TerminalPanel />
      <main
        className="pt-16 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 220 }}
      >
        <motion.div
          key={useLocation().pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="*" element={<Login />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clusters" element={<Clusters />} />
          <Route path="/workloads" element={<Workloads />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/cost" element={<Cost />} />
          <Route path="/services" element={<Services />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
