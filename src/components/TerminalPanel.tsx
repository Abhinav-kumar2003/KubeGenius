import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { k8sEvents } from '@/data/mockData';

const mockResponses: Record<string, string> = {
  help: 'Available commands:\n  get pods              List all pods\n  get deployments       List all deployments\n  get nodes             List all nodes\n  get services          List all services\n  get events            List recent events\n  scale deployment      Scale a deployment\n  logs                  View pod logs\n  top                   Show resource usage\n  predict               Run AI prediction\n  clear                 Clear terminal',
  'get pods': 'NAME                              READY   STATUS    RESTARTS   AGE\nfrontend-app-7d9f4b8c5-x2v9m    1/1     Running   0          4h\nfrontend-app-7d9f4b8c5-kp3n2    1/1     Running   0          4h\nbackend-api-5c8a2d1e4-9x4vq       1/1     Running   1          2h\nml-predictor-3b7e9f2a1-m8k5p      1/1     Running   0          1h\nredis-cache-9d2c4b7e1-r6t3y       1/1     Running   0          8h\npostgres-db-4a8f1c3b9-n5w7q       1/1     Running   0          8h',
  'get deployments': 'NAME             READY   UP-TO-DATE   AVAILABLE   AGE\nfrontend-app     4/4     4            4           14d\nbackend-api      6/6     6            6           7d\nml-predictor     3/3     3            3           3d\nnginx-ingress    2/2     2            2           21d\nprometheus       1/1     1            1           30d\ngrafana          1/1     1            1           30d\nredis-cache      2/2     2            2           45d\npostgres-db      1/1     1            1           45d',
  'get nodes': 'NAME            STATUS   ROLES           AGE    VERSION\nip-10-0-1-45    Ready    worker          45d    v1.29.0\nip-10-0-1-46    Ready    worker          45d    v1.29.0\nip-10-0-1-47    Ready    worker          45d    v1.29.0\nip-10-0-1-48    Ready    worker-gpu      45d    v1.29.0\nip-10-0-1-49    Ready    worker          45d    v1.29.0\nip-10-0-1-10    Ready    control-plane   45d    v1.29.0',
  'get events': k8sEvents.slice(0, 6).map(e => `${e.timestamp}  ${e.type}  ${e.reason}  ${e.object}  ${e.message}`).join('\n'),
  predict: 'AI Prediction Engine v3.1.0\n═══════════════════════════════════════\nAnalyzing last 60 minutes of metrics...\n\nTraffic forecast (next 30 min):\n  +15% expected increase at 09:45\n  Confidence: 94.2%\n\nScaling recommendation:\n  frontend-app: 4 → 5 replicas\n  backend-api: 6 → 7 replicas\n\nEstimated cost impact: +$2.40/hour',
  'get services': 'NAME            TYPE          CLUSTER-IP      EXTERNAL-IP                     PORT(S)\nfrontend-svc    ClusterIP     10.100.12.45    <none>                          80/TCP\nbackend-svc     ClusterIP     10.100.12.67    <none>                          8080/TCP\nml-svc          ClusterIP     10.100.12.89    <none>                          5000/TCP\nnginx-ingress   LoadBalancer  10.100.12.12    a1b2c3d4.elb.amazonaws.com      80:80/TCP,443:443/TCP',
  top: 'NAME                              CPU(cores)   MEMORY(bytes)\nfrontend-app-7d9f4b8c5-x2v9m    145m         256Mi\nfrontend-app-7d9f4b8c5-kp3n2    132m         241Mi\nbackend-api-5c8a2d1e4-9x4vq       412m         512Mi\nml-predictor-3b7e9f2a1-m8k5p      823m         1.8Gi\nredis-cache-9d2c4b7e1-r6t3y       67m          892Mi\npostgres-db-4a8f1c3b9-n5w7q       234m         1.2Gi',
  'scale deployment': 'Usage: scale deployment <name> <replicas>\nExample: scale deployment frontend-app 5',
  logs: 'Usage: logs <pod-name>\nExample: logs frontend-app-7d9f4b8c5-x2v9m',
  clear: '',
};

export default function TerminalPanel() {
  const { terminalOpen, toggleTerminal } = useUIStore();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    { type: 'output', text: 'KubeGenius AI Terminal v3.1.0\nType "help" for available commands.' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const newHistory = [...history, { type: 'input' as const, text: `user@kubegenius:~$ ${command}` }];

    const cmd = command.trim().toLowerCase();
    let response = 'Command not found. Type "help" for available commands.';

    if (cmd === 'clear') {
      setHistory([{ type: 'output', text: 'Terminal cleared.' }]);
      setCommand('');
      return;
    }

    for (const [key, value] of Object.entries(mockResponses)) {
      if (cmd === key || cmd.startsWith(key + ' ')) {
        response = value;
        break;
      }
    }

    if (cmd.startsWith('logs ')) {
      response = `[2024-01-15T09:32:10Z] INFO  Server started on port 8080\n[2024-01-15T09:32:11Z] INFO  Connected to database\n[2024-01-15T09:32:15Z] INFO  Health check passed\n[2024-01-15T09:33:00Z] WARN  High latency detected: 245ms\n[2024-01-15T09:33:30Z] INFO  Request processed: GET /api/v1/predictions\n[2024-01-15T09:34:00Z] INFO  Auto-scaling triggered: 3 → 4 replicas`;
    }

    if (cmd.startsWith('scale deployment ')) {
      const parts = cmd.split(' ');
      if (parts.length >= 4) {
        response = `deployment.apps/${parts[2]} scaled to ${parts[3]} replicas\nScaling event logged. AI engine monitoring...`;
      }
    }

    newHistory.push({ type: 'output', text: response });
    setHistory(newHistory);
    setCommand('');
  };

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-16 bottom-0 w-[420px] z-30 bg-[#0C0E14]/95 backdrop-blur-xl border-l border-white/[0.06] flex flex-col"
        >
          {/* Header */}
          <div className="h-10 flex items-center justify-between px-4 border-b border-white/[0.06]">
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Terminal & Events</span>
            <button onClick={toggleTerminal} className="text-white/40 hover:text-white/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Terminal Output */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[12px]">
            {history.map((entry, i) => (
              <div key={i} className={entry.type === 'input' ? 'text-green-400/80' : 'text-white/60 whitespace-pre-wrap'}>
                {entry.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] focus-within:border-blue-500/50">
              <span className="text-green-400/60 text-[12px] font-mono shrink-0">$</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-[12px] font-mono text-white/80 placeholder:text-white/20 focus:outline-none"
              />
              <button type="submit" className="text-white/30 hover:text-blue-400 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Events */}
          <div className="h-[200px] border-t border-white/[0.06] overflow-y-auto">
            <div className="px-4 py-2 text-[10px] font-medium text-white/30 uppercase tracking-wider border-b border-white/[0.04]">
              Live Events
            </div>
            <div className="divide-y divide-white/[0.03]">
              {k8sEvents.map((event, i) => (
                <div key={i} className="px-4 py-2 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-1 h-full min-h-[20px] rounded-full shrink-0 ${event.type === 'Warning' ? 'bg-red-400' : event.reason === 'AIPrediction' ? 'bg-purple-400' : 'bg-blue-400'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 font-mono">{event.timestamp}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${event.type === 'Warning' ? 'bg-red-400/10 text-red-400' : 'bg-blue-400/10 text-blue-400'}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5 truncate">{event.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
