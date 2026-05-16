import { motion } from 'framer-motion';
import {
  BrainCircuit, TrendingUp, Activity, Target, BarChart3,
  Zap, Shield, AlertTriangle, CheckCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { generatePredictionSeries, mlMetrics, scalingEvents } from '@/data/mockData';
import { mlApi } from '@/lib/api';
import { useWebSocket } from '@/hooks/use-socket';
import { useState, useEffect } from 'react';


const recommendationData = [
  { name: 'Scale Up', confidence: 94, urgency: 85, type: 'up' },
  { name: 'Scale Down', confidence: 78, urgency: 30, type: 'down' },
  { name: 'Maintain', confidence: 92, urgency: 15, type: 'maintain' },
  { name: 'Alert', confidence: 67, urgency: 60, type: 'alert' },
];

const radarData = [
  { metric: 'Accuracy', value: mlMetrics.accuracy },
  { metric: 'Precision', value: mlMetrics.precision },
  { metric: 'Recall', value: mlMetrics.recall },
  { metric: 'F1 Score', value: mlMetrics.f1Score },
  { metric: 'Latency', value: 95 },
  { metric: 'Coverage', value: 88 },
];

export default function Predictions() {
  const { data: liveML } = useWebSocket<any>('/ml');
  const [predictionData, setPredictionData] = useState(() => generatePredictionSeries(30, 20));
  const [metrics, setMetrics] = useState(mlMetrics);
  const [recommendations, setRecommendations] = useState(recommendationData);

  useEffect(() => {
    if (liveML) {
      if (liveML.prediction_series) setPredictionData(liveML.prediction_series);
      if (liveML.metrics) setMetrics(liveML.metrics);
      if (liveML.recommendations) setRecommendations(liveML.recommendations);
    }
  }, [liveML]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const response = await mlApi.getStatus();
        if (response.data) {
          setMetrics(response.data.metrics || mlMetrics);
        }
      } catch (err) {
        console.error("Failed to fetch ML status", err);
      }
    };
    fetchInitial();
  }, []);
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-white/90 tracking-tight">AI Predictions</h1>
          <p className="text-[13px] text-white/40 mt-0.5">LSTM-powered traffic forecasting and scaling recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-medium text-purple-400">LSTM v3.1.0 Active</span>
          </div>
        </div>
      </motion.div>

      {/* ML Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Accuracy', value: `${metrics.accuracy}%`, icon: Target, color: 'text-green-400' },
          { label: 'MAE', value: metrics.mae, icon: BarChart3, color: 'text-blue-400' },
          { label: 'RMSE', value: metrics.rmse, icon: Activity, color: 'text-amber-400' },
          { label: 'Predictions Today', value: metrics.predictionsToday.toLocaleString(), icon: TrendingUp, color: 'text-purple-400' },
          { label: 'True Positives', value: metrics.truePositives, icon: CheckCircle, color: 'text-green-400' },
          { label: 'False Positives', value: metrics.falsePositives, icon: AlertTriangle, color: 'text-red-400' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="metric-card rounded-xl p-4 text-center"
          >
            <m.icon className={`w-4 h-4 mx-auto mb-2 ${m.color}`} />
            <div className="text-[20px] font-semibold font-mono text-white/80">{m.value}</div>
            <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Prediction Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="metric-card rounded-xl p-5 animate-pulse-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-medium text-white/70">30-Minute Traffic Forecast</h3>
            <p className="text-[11px] text-white/30 mt-0.5">AI predicts +15% traffic spike at 09:45 with 94% confidence</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-amber-500" />
              <span className="text-white/40">Historical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 rounded bg-blue-500" />
              <span className="text-white/40">AI Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-500/10" />
              <span className="text-white/40">Confidence Band</span>
            </div>
          </div>
        </div>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a1d2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confBand)" />
              <Area type="monotone" dataKey="actual" stroke="#F59E0B" strokeWidth={2} fill="none" name="Historical" />
              <Area type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={3} fill="url(#predGrad)" name="AI Forecast" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#0C0E14" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        {/* Model Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card rounded-xl p-5"
        >
          <h3 className="text-[13px] font-medium text-white/70 mb-1">Model Performance</h3>
          <p className="text-[11px] text-white/30 mb-4">Last training: {new Date(metrics.lastTraining).toLocaleString()}</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="#8B5CF6" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Scaling Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card rounded-xl p-5"
        >
          <h3 className="text-[13px] font-medium text-white/70 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={rec.name} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {rec.type === 'up' ? <Zap className="w-3.5 h-3.5 text-green-400" /> :
                     rec.type === 'down' ? <TrendingUp className="w-3.5 h-3.5 text-blue-400 rotate-180" /> :
                     rec.type === 'alert' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> :
                     <Shield className="w-3.5 h-3.5 text-purple-400" />}
                    <span className="text-[12px] font-medium text-white/70">{rec.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-400">{rec.confidence}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.04]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.urgency}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: rec.urgency > 70 ? '#EF4444' : rec.urgency > 40 ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-white/30 w-8 text-right">{rec.urgency}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Predictions Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="metric-card rounded-xl p-5"
        >
          <h3 className="text-[13px] font-medium text-white/70 mb-4">Scaling Events</h3>
          <div className="space-y-2">
            {scalingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BrainCircuit className="w-3 h-3 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-white/70">{event.deployment}</span>
                    <span className="text-[10px] font-mono text-purple-400/60">{event.confidence}%</span>
                  </div>
                  <p className="text-[10px] text-white/30 truncate">{event.reason}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-mono text-white/20">{event.from} → {event.to}</span>
                  </div>
                </div>
                <span className="text-[10px] text-white/20 font-mono shrink-0">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
