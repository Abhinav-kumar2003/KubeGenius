# KubeGenius 🚀

AI-powered Kubernetes predictive autoscaling and monitoring platform.

## Features
- **AI Traffic Prediction**: LSTM-powered forecasting to anticipate demand.
- **Real-Time Dashboard**: Live monitoring of CPU, Memory, and Pod distribution.
- **Intelligent Autoscaling**: Proactive scaling decisions based on AI forecasts.
- **Cluster Management**: Direct control over deployments, nodes, and namespaces.
- **Enterprise Security**: Production-ready Clerk authentication featuring seamless Google/GitHub Single Sign-On (SSO), secure email/password access, and automated JWT session token synchronization.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, `@clerk/clerk-react`
- **Backend**: FastAPI (Python), WebSocket, SQLAlchemy
- **ML Engine**: TensorFlow, LSTM Neural Networks
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker, Kubernetes, Helm, Terraform

## Environment Configuration

To run the frontend application, create a `.env.local` file in the root directory. This file stores your Clerk authentication credentials locally and is automatically ignored by Git:

```env
# Clerk Keys (Obtained from dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Installation

```bash
# Clone the repository
git clone https://github.com/Abhinav-kumar2003/KubeGenius.git
cd KubeGenius

# Start the full stack with Docker
docker-compose up -d

# Access the platform
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```
