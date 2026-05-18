import { useUIStore, useDashboardStore } from '@/lib/store';
import { Bell, Search, Terminal, ChevronDown, Server, Clock } from 'lucide-react';
import { clusters, namespaces } from '@/data/mockData';
import { UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

export default function Header() {
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);
  const notifications = useUIStore((s) => s.notifications);
  const { selectedCluster, selectedNamespace, timeRange, setSelectedCluster, setSelectedNamespace, setTimeRange } = useDashboardStore();
  const unreadCount = notifications.filter((n) => n.status === 'firing').length;

  return (
    <header className="h-16 glass-header fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-5"
      style={{ marginLeft: '220px' }}
    >
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-64 h-8 pl-9 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
          />
        </div>

        {/* Cluster Selector */}
        <div className="relative">
          <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/60" />
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="h-8 pl-9 pr-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
          >
            {clusters.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0C0E14]">
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
        </div>

        {/* Namespace Selector */}
        <div className="relative">
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="h-8 pl-3 pr-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
          >
            {namespaces.map((ns) => (
              <option key={ns} value={ns} className="bg-[#0C0E14]">
                {ns === 'all' ? 'All Namespaces' : ns}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
        </div>

        {/* Time Range */}
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-8 pl-9 pr-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/70 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
          >
            <option value="5m" className="bg-[#0C0E14]">Last 5m</option>
            <option value="15m" className="bg-[#0C0E14]">Last 15m</option>
            <option value="1h" className="bg-[#0C0E14]">Last 1h</option>
            <option value="6h" className="bg-[#0C0E14]">Last 6h</option>
            <option value="24h" className="bg-[#0C0E14]">Last 24h</option>
            <option value="7d" className="bg-[#0C0E14]">Last 7d</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTerminal}
          className="h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all flex items-center gap-2 text-[12px]"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Terminal</span>
        </button>

        <button className="relative h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all flex items-center justify-center">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/[0.06]">
          <UserButton
            appearance={{
              baseTheme: dark,
              elements: {
                userButtonAvatarBox: 'w-7 h-7 rounded-full border border-white/[0.08]',
                userButtonTrigger: 'focus:shadow-none focus:outline-none'
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
