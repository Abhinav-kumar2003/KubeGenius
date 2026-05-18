import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Line,
} from 'recharts';
import {
  Cpu, MemoryStick, Container, Activity, TrendingUp, Shield,
  ArrowUpRight, ArrowDownRight, Server, Zap,
} from 'lucide-react';
import { generateTimeSeries, generatePredictionSeries, clusters, nodes, scalingEvents } from '@/data/mockData';
import { metricsApi } from '@/lib/api';
import { useWebSocket } from '@/hooks/use-socket';


// Initial static data moved inside component state


function MetricCard({ title, value, unit, change, changeType, icon: Icon, delay }: {
  title: string; value: string | number; unit?: string; change: number; changeType: 'up' | 'down';
  icon: React.ElementType; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="metric-card rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-blue-400" />
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-1">{title}</div>
      <div className="text-[28px] font-semibold text-white/90 tracking-tight">
        {value}<span className="text-[14px] text-white/40 ml-1 font-normal">{unit}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  // 1. WebSocket Hook for real-time metrics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: liveMetrics, isConnected } = useWebSocket<any>('/metrics');
  
  // 2. Data State
  const [cpuData, setCpuData] = useState(() => generateTimeSeries(30, 65, 15));
  const [memoryData, setMemoryData] = useState(() => generateTimeSeries(30, 70, 10));
  const [predictionData, setPredictionData] = useState(() => generatePredictionSeries(20, 15));
  
  const [stats, setStats] = useState({
    cpu: 68,
    memory: 72,
    pods: 55,
    nodes: 6,
    cpuChange: 12,
    memChange: 5,
    podChange: 8
  });

  // 3. Update state when live metrics arrive
  useEffect(() => {
    if (liveMetrics) {
      setStats({
        cpu: liveMetrics.cluster?.cpu_percent ?? liveMetrics.cpu ?? stats.cpu,
        memory: liveMetrics.cluster?.memory_percent ?? liveMetrics.memory ?? stats.memory,
        pods: liveMetrics.cluster?.pod_count ?? liveMetrics.pods ?? stats.pods,
        nodes: liveMetrics.cluster?.node_count ?? (Array.isArray(liveMetrics.nodes) ? liveMetrics.nodes.length : (liveMetrics.nodes ?? stats.nodes)),
        cpuChange: liveMetrics.cluster?.cpu_change ?? liveMetrics.cpu_change ?? stats.cpuChange,
        memChange: liveMetrics.cluster?.mem_change ?? liveMetrics.mem_change ?? stats.memChange,
        podChange: liveMetrics.cluster?.pod_change ?? liveMetrics.pod_change ?? stats.podChange
      });

      if (liveMetrics.cpu_series) setCpuData(liveMetrics.cpu_series);
      if (liveMetrics.memory_series) setMemoryData(liveMetrics.memory_series);
      if (liveMetrics.prediction_series) setPredictionData(liveMetrics.prediction_series);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMetrics]);

  // 4. Initial fetch from REST API
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const response = await metricsApi.getCluster();
        if (response.data) {
          // Process initial data
        }
      } catch (err) {
        console.error("Failed to fetch initial cluster metrics", err);
      }
    };
    fetchInitial();
  }, []);

  // 5. Simulation Logic (Fallback if not connected)
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setCpuData(prev => {
          const lastVal = prev[prev.length - 1].value;
          const nextVal = Math.max(20, Math.min(95, lastVal + (Math.random() - 0.5) * 8));
          return [...prev.slice(1), { time: timeStr, timestamp: now.getTime(), value: Number(nextVal.toFixed(1)) }];
        });

        setMemoryData(prev => {
          const lastVal = prev[prev.length - 1].value;
          const nextVal = Math.max(30, Math.min(90, lastVal + (Math.random() - 0.5) * 4));
          return [...prev.slice(1), { time: timeStr, timestamp: now.getTime(), value: Number(nextVal.toFixed(1)) }];
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const [podData] = useState([
    { time: '08:00', running: 42, pending: 2, failed: 0 },
    { time: '08:30', running: 45, pending: 3, failed: 0 },
    { time: '09:00', running: 48, pending: 1, failed: 1 },
    { time: '09:30', running: 52, pending: 0, failed: 0 },
    { time: '10:00', running: 55, pending: 2, failed: 0 },
  ]);

  const [healthData] = useState([
    { name: 'Healthy', value: nodes.filter(n => n.status === 'Ready').length, color: '#10B981' },
    { name: 'Warning', value: 0, color: '#F59E0B' },
    { name: 'Critical', value: 0, color: '#EF4444' },
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">Cluster Overview</h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            {isConnected ? 'Real-time monitoring connected' : 'Monitoring system initializing...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isConnected ? 'bg-green-400/10 border-green-400/20' : 'bg-amber-400/10 border-amber-400/20'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={`text-[11px] font-medium ${isConnected ? 'text-green-400' : 'text-amber-400'}`}>
              {isConnected ? 'BACKEND: CONNECTED' : 'BACKEND: CONNECTING...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-[11px] font-medium text-blue-400">AI ACTIVE</span>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-5">
        <MetricCard title="Cluster CPU" value={stats.cpu} unit="%" change={stats.cpuChange} changeType={stats.cpuChange >= 0 ? 'up' : 'down'} icon={Cpu} delay={0} />
        <MetricCard title="Memory" value={stats.memory} unit="%" change={stats.memChange} changeType={stats.memChange >= 0 ? 'up' : 'down'} icon={MemoryStick} delay={0.1} />
        <MetricCard title="Active Pods" value={stats.pods} unit="" change={stats.podChange} changeType={stats.podChange >= 0 ? 'up' : 'down'} icon={Container} delay={0.2} />
        <MetricCard title="Nodes" value={stats.nodes} unit="" change={0} changeType="down" icon={Server} delay={0.3} />
      </div>


      {/* Main Chart Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Predictive Demand Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-2 metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-medium text-white/70">AI Demand Forecast</h3>
              <p className="text-[11px] text-white/30 mt-0.5">Historical vs Predicted traffic with 94% confidence</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 rounded bg-amber-500" />
                <span className="text-white/40">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-1 rounded bg-blue-500" />
                <span className="text-white/40">AI Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-purple-500/20" />
                <span className="text-white/40">Confidence</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#0C0E14" />
                <Line type="monotone" dataKey="actual" stroke="#F59E0B" strokeWidth={2} dot={false} name="Actual" />
                <Area type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={3} fill="url(#predictGrad)" name="Predicted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cluster Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card rounded-xl p-5 flex flex-col"
        >
          <h3 className="text-[13px] font-medium text-white/70 mb-1">Cluster Health</h3>
          <p className="text-[11px] text-white/30 mb-4">Node status distribution</p>
          <div className="flex-1 flex items-center justify-center">
            <PieChart width={180} height={180}>
              <Pie data={healthData} cx={90} cy={90} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {healthData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/50">{item.name}</span>
                </div>
                <span className="text-white/80 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* CPU Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-white/70">CPU Usage</h3>
            <Cpu className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#cpuGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Memory Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-white/70">Memory Usage</h3>
            <MemoryStick className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryData}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#memGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pod Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-white/70">Pod Distribution</h3>
            <Container className="w-4 h-4 text-white/20" />
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={podData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="running" stackId="pods" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="pods" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="failed" stackId="pods" fill="#EF4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Third Row: Scaling Events + Cluster List */}
      <div className="grid grid-cols-2 gap-5">
        {/* Scaling Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-medium text-white/70">Scaling Activity</h3>
              <p className="text-[11px] text-white/30 mt-0.5">AI-driven and reactive scaling events</p>
            </div>
            <TrendingUp className="w-4 h-4 text-purple-400/60" />
          </div>
          <div className="space-y-2">
            {scalingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03]">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-white/70">{event.deployment}</span>
                    <span className="text-[10px] text-white/30">{event.namespace}</span>
                  </div>
                  <p className="text-[11px] text-white/40 truncate">{event.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-mono text-white/60">
                    <span className="text-white/30">{event.from}</span>
                    <span className="mx-1 text-purple-400/60">→</span>
                    <span className="text-green-400">{event.to}</span>
                  </div>
                  <div className="text-[10px] text-purple-400/60">{event.confidence}% confidence</div>
                </div>
                <div className="text-[10px] text-white/20 font-mono shrink-0">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cluster List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="metric-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-medium text-white/70">Clusters</h3>
              <p className="text-[11px] text-white/30 mt-0.5">Multi-cluster overview</p>
            </div>
            <Shield className="w-4 h-4 text-green-400/60" />
          </div>
          <div className="space-y-2">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{
                  backgroundColor: cluster.status === 'healthy' ? '#10B981' : cluster.status === 'warning' ? '#F59E0B' : '#EF4444'
                }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-white/70">{cluster.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30">{cluster.provider}</span>
                    <span className="text-[10px] text-white/20">{cluster.region}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/30">v{cluster.version}</span>
                    <span className="text-[10px] text-white/30">{cluster.nodes} nodes</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-white/30">CPU</div>
                    <div className="text-[11px] font-mono" style={{ color: cluster.cpu > 80 ? '#EF4444' : cluster.cpu > 60 ? '#F59E0B' : '#10B981' }}>{cluster.cpu}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/30">Mem</div>
                    <div className="text-[11px] font-mono" style={{ color: cluster.memory > 80 ? '#EF4444' : cluster.memory > 60 ? '#F59E0B' : '#10B981' }}>{cluster.memory}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
