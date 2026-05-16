export const clusters = [
  { id: 'production-eks', name: 'production-eks', provider: 'AWS', region: 'us-west-2', version: '1.29', nodes: 12, status: 'healthy', cpu: 68, memory: 72 },
  { id: 'staging-eks', name: 'staging-eks', provider: 'AWS', region: 'us-east-1', version: '1.29', nodes: 5, status: 'healthy', cpu: 34, memory: 41 },
  { id: 'dev-gke', name: 'dev-gke', provider: 'GCP', region: 'us-central1', version: '1.28', nodes: 3, status: 'warning', cpu: 89, memory: 76 },
  { id: 'dr-aks', name: 'dr-aks', provider: 'Azure', region: 'west-europe', version: '1.28', nodes: 4, status: 'healthy', cpu: 12, memory: 18 },
];

export const namespaces = ['all', 'kube-system', 'default', 'app-frontend', 'app-backend', 'app-ml', 'monitoring', 'ingress-nginx'];

export const generateTimeSeries = (points: number, baseValue: number, variance: number, trend: number = 0) => {
  const data = [];
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const time = now - i * 60000;
    const value = baseValue + Math.sin(i * 0.1) * variance + (points - i) * trend + (Math.random() - 0.5) * variance * 0.5;
    data.push({
      time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time,
      value: Math.max(0, Math.min(100, Number(value.toFixed(1)))),
    });
  }
  return data;
};

export const generatePredictionSeries = (historicalPoints: number, futurePoints: number) => {
  const historical = [];
  const predictions = [];
  const now = Date.now();

  for (let i = historicalPoints; i >= 0; i--) {
    const time = now - i * 60000;
    const base = 45 + Math.sin(i * 0.08) * 20 + (historicalPoints - i) * 0.02;
    const value = base + (Math.random() - 0.5) * 5;
    historical.push({
      time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actual: Math.max(0, Math.min(100, Number(value.toFixed(1)))),
      predicted: null,
      upper: null,
      lower: null,
    });
  }

  const lastHistorical = historical[historical.length - 1];
  let lastValue = lastHistorical.actual;

  for (let i = 1; i <= futurePoints; i++) {
    const time = now + i * 60000;
    const trend = 45 + Math.sin((historicalPoints + i) * 0.08) * 20 + (historicalPoints + i) * 0.02;
    const predicted = lastValue + (trend - lastValue) * 0.3 + (Math.random() - 0.5) * 3;
    const confidence = 2 + i * 0.8;
    predictions.push({
      time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actual: null,
      predicted: Number(predicted.toFixed(1)),
      upper: Number((predicted + confidence).toFixed(1)),
      lower: Number((predicted - confidence).toFixed(1)),
    });
    lastValue = predicted;
  }

  return [...historical, ...predictions];
};

export const deployments = [
  { name: 'frontend-app', namespace: 'app-frontend', replicas: 4, ready: 4, cpu: 62, memory: 48, status: 'Running', age: '14d', image: 'frontend:v2.3.1' },
  { name: 'backend-api', namespace: 'app-backend', replicas: 6, ready: 6, cpu: 78, memory: 65, status: 'Running', age: '7d', image: 'backend:v1.8.2' },
  { name: 'ml-predictor', namespace: 'app-ml', replicas: 3, ready: 3, cpu: 91, memory: 82, status: 'Running', age: '3d', image: 'ml-engine:v3.1.0' },
  { name: 'nginx-ingress', namespace: 'ingress-nginx', replicas: 2, ready: 2, cpu: 34, memory: 28, status: 'Running', age: '21d', image: 'nginx-ingress:v1.9.4' },
  { name: 'prometheus', namespace: 'monitoring', replicas: 1, ready: 1, cpu: 45, memory: 72, status: 'Running', age: '30d', image: 'prometheus:v2.47.0' },
  { name: 'grafana', namespace: 'monitoring', replicas: 1, ready: 1, cpu: 22, memory: 56, status: 'Running', age: '30d', image: 'grafana:v10.1.0' },
  { name: 'redis-cache', namespace: 'app-backend', replicas: 2, ready: 2, cpu: 15, memory: 88, status: 'Running', age: '45d', image: 'redis:7.2' },
  { name: 'postgres-db', namespace: 'app-backend', replicas: 1, ready: 1, cpu: 38, memory: 64, status: 'Running', age: '45d', image: 'postgres:15.4' },
];

export const pods = [
  { name: 'frontend-app-7d9f4b8c5-x2v9m', namespace: 'app-frontend', status: 'Running', restarts: 0, cpu: '145m', memory: '256Mi', node: 'ip-10-0-1-45', age: '4h' },
  { name: 'frontend-app-7d9f4b8c5-kp3n2', namespace: 'app-frontend', status: 'Running', restarts: 0, cpu: '132m', memory: '241Mi', node: 'ip-10-0-1-46', age: '4h' },
  { name: 'backend-api-5c8a2d1e4-9x4vq', namespace: 'app-backend', status: 'Running', restarts: 1, cpu: '412m', memory: '512Mi', node: 'ip-10-0-1-47', age: '2h' },
  { name: 'ml-predictor-3b7e9f2a1-m8k5p', namespace: 'app-ml', status: 'Running', restarts: 0, cpu: '823m', memory: '1.8Gi', node: 'ip-10-0-1-48', age: '1h' },
  { name: 'redis-cache-9d2c4b7e1-r6t3y', namespace: 'app-backend', status: 'Running', restarts: 0, cpu: '67m', memory: '892Mi', node: 'ip-10-0-1-45', age: '8h' },
  { name: 'postgres-db-4a8f1c3b9-n5w7q', namespace: 'app-backend', status: 'Running', restarts: 0, cpu: '234m', memory: '1.2Gi', node: 'ip-10-0-1-49', age: '8h' },
];

export const nodes = [
  { name: 'ip-10-0-1-45', role: 'worker', status: 'Ready', cpu: 72, memory: 68, pods: 18, disk: 45, os: 'Ubuntu 22.04', kernel: '5.15.0', containerRuntime: 'containerd://1.7.8' },
  { name: 'ip-10-0-1-46', role: 'worker', status: 'Ready', cpu: 65, memory: 71, pods: 16, disk: 38, os: 'Ubuntu 22.04', kernel: '5.15.0', containerRuntime: 'containerd://1.7.8' },
  { name: 'ip-10-0-1-47', role: 'worker', status: 'Ready', cpu: 81, memory: 74, pods: 20, disk: 52, os: 'Ubuntu 22.04', kernel: '5.15.0', containerRuntime: 'containerd://1.7.8' },
  { name: 'ip-10-0-1-48', role: 'worker-gpu', status: 'Ready', cpu: 94, memory: 88, pods: 12, disk: 61, os: 'Ubuntu 22.04', kernel: '5.15.0', containerRuntime: 'containerd://1.7.8' },
  { name: 'ip-10-0-1-49', role: 'worker', status: 'Ready', cpu: 58, memory: 62, pods: 15, disk: 33, os: 'Ubuntu 22.04', kernel: '5.15.0', containerRuntime: 'containerd://1.7.8' },
  { name: 'ip-10-0-1-10', role: 'control-plane', status: 'Ready', cpu: 34, memory: 45, pods: 11, disk: 28, os: 'Ubuntu 22.04', kernel: '5.15.0', containerRuntime: 'containerd://1.7.8' },
];

export const alerts = [
  { id: '1', severity: 'critical', title: 'High CPU Usage', message: 'ml-predictor pod CPU usage exceeded 90%', source: 'prometheus', namespace: 'app-ml', pod: 'ml-predictor-3b7e9f2a1-m8k5p', timestamp: '2024-01-15T09:23:00Z', status: 'firing' },
  { id: '2', severity: 'warning', title: 'Memory Pressure', message: 'Node ip-10-0-1-48 memory usage at 88%', source: 'prometheus', namespace: 'kube-system', pod: '', timestamp: '2024-01-15T09:15:00Z', status: 'firing' },
  { id: '3', severity: 'info', title: 'Pod Restart', message: 'backend-api pod restarted 1 time', source: 'kubernetes', namespace: 'app-backend', pod: 'backend-api-5c8a2d1e4-9x4vq', timestamp: '2024-01-15T08:45:00Z', status: 'resolved' },
  { id: '4', severity: 'warning', title: 'AI Prediction', message: 'Traffic spike predicted in 15 minutes', source: 'ai-engine', namespace: 'app-frontend', pod: '', timestamp: '2024-01-15T09:30:00Z', status: 'firing' },
  { id: '5', severity: 'critical', title: 'Disk Pressure', message: 'Node ip-10-0-1-48 disk usage at 61%', source: 'prometheus', namespace: 'kube-system', pod: '', timestamp: '2024-01-15T07:12:00Z', status: 'firing' },
  { id: '6', severity: 'info', title: 'Scaling Event', message: 'frontend-app scaled from 3 to 4 replicas', source: 'autoscaler', namespace: 'app-frontend', pod: '', timestamp: '2024-01-15T06:30:00Z', status: 'resolved' },
];

export const scalingEvents = [
  { id: '1', deployment: 'frontend-app', namespace: 'app-frontend', from: 3, to: 4, reason: 'AI predicted traffic spike', confidence: 94, timestamp: '09:30:15' },
  { id: '2', deployment: 'backend-api', namespace: 'app-backend', from: 4, to: 6, reason: 'CPU threshold exceeded', confidence: 87, timestamp: '08:45:22' },
  { id: '3', deployment: 'ml-predictor', namespace: 'app-ml', from: 2, to: 3, reason: 'Queue depth increasing', confidence: 91, timestamp: '07:12:08' },
  { id: '4', deployment: 'frontend-app', namespace: 'app-frontend', from: 4, to: 3, reason: 'Traffic normalized', confidence: 89, timestamp: '06:15:33' },
];

export const costData = {
  daily: [
    { day: 'Mon', compute: 142, storage: 34, network: 18, ml: 56 },
    { day: 'Tue', compute: 158, storage: 34, network: 22, ml: 62 },
    { day: 'Wed', compute: 134, storage: 35, network: 15, ml: 48 },
    { day: 'Thu', compute: 189, storage: 36, network: 28, ml: 71 },
    { day: 'Fri', compute: 201, storage: 36, network: 31, ml: 78 },
    { day: 'Sat', compute: 98, storage: 36, network: 12, ml: 42 },
    { day: 'Sun', compute: 87, storage: 36, network: 10, ml: 38 },
  ],
  idleResources: [
    { name: 'dev-gke', type: 'Cluster', monthlyWaste: 342, recommendation: 'Scale to 2 nodes on weekends' },
    { name: 'staging-eks', type: 'Cluster', monthlyWaste: 189, recommendation: 'Use scheduled scaling' },
    { name: 'postgres-db', type: 'Pod', monthlyWaste: 67, recommendation: 'Right-size to 512Mi memory' },
    { name: 'redis-cache', type: 'Pod', monthlyWaste: 45, recommendation: 'Reduce to 1 replica during off-peak' },
  ],
};

export const mlMetrics = {
  accuracy: 94.2,
  precision: 91.8,
  recall: 89.5,
  f1Score: 90.6,
  mae: 2.34,
  rmse: 3.87,
  lastTraining: '2024-01-15T06:00:00Z',
  predictionsToday: 1847,
  truePositives: 342,
  falsePositives: 28,
  falseNegatives: 41,
};

export const k8sEvents = [
  { timestamp: '09:32:15', type: 'Normal', reason: 'Created', object: 'Pod/frontend-app-7d9f4b8c5-x9k2m', message: 'Created container frontend' },
  { timestamp: '09:30:45', type: 'Normal', reason: 'ScalingReplicaSet', object: 'Deployment/frontend-app', message: 'Scaled up replica set frontend-app-7d9f4b8c5 to 4' },
  { timestamp: '09:28:12', type: 'Warning', reason: 'HighCPU', object: 'Pod/ml-predictor-3b7e9f2a1-m8k5p', message: 'CPU usage exceeded threshold: 91%' },
  { timestamp: '09:25:33', type: 'Normal', reason: 'Pulled', object: 'Pod/backend-api-5c8a2d1e4-9x4vq', message: 'Successfully pulled image backend:v1.8.2' },
  { timestamp: '09:22:08', type: 'Normal', reason: 'Scheduled', object: 'Pod/redis-cache-9d2c4b7e1-r6t3y', message: 'Successfully assigned to ip-10-0-1-45' },
  { timestamp: '09:18:44', type: 'Warning', reason: 'MemoryPressure', object: 'Node/ip-10-0-1-48', message: 'Memory pressure condition detected' },
  { timestamp: '09:15:22', type: 'Normal', reason: 'Killing', object: 'Pod/frontend-app-7d9f4b8c5-x2v9m', message: 'Stopping container frontend' },
  { timestamp: '09:12:00', type: 'Normal', reason: 'AIPrediction', object: 'Autoscaler/ai-engine', message: 'Predicted traffic spike with 94% confidence' },
];

export const services = [
  { name: 'frontend-svc', namespace: 'app-frontend', type: 'ClusterIP', clusterIP: '10.100.12.45', ports: '80:8080/TCP', selector: 'app=frontend', age: '14d' },
  { name: 'backend-svc', namespace: 'app-backend', type: 'ClusterIP', clusterIP: '10.100.12.67', ports: '8080:8080/TCP', selector: 'app=backend', age: '7d' },
  { name: 'ml-svc', namespace: 'app-ml', type: 'ClusterIP', clusterIP: '10.100.12.89', ports: '5000:5000/TCP', selector: 'app=ml-predictor', age: '3d' },
  { name: 'nginx-ingress', namespace: 'ingress-nginx', type: 'LoadBalancer', clusterIP: '10.100.12.12', externalIP: 'a1b2c3d4-nginx.elb.amazonaws.com', ports: '80:80/TCP,443:443/TCP', selector: 'app=nginx-ingress', age: '21d' },
  { name: 'redis-svc', namespace: 'app-backend', type: 'ClusterIP', clusterIP: '10.100.12.34', ports: '6379:6379/TCP', selector: 'app=redis', age: '45d' },
];
