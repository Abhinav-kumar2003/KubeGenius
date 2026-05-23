# KubeGenius 🚀

**AI‑powered Kubernetes predictive autoscaling & monitoring platform**

[![GitHub stars](https://img.shields.io/github/stars/Abhinav-kumar2003/KubeGenius?style=flat-square)](https://github.com/Abhinav-kumar2003/KubeGenius/stargazers)
[![License](https://img.shields.io/github/license/Abhinav-kumar2003/KubeGenius?style=flat-square)](https://github.com/Abhinav-kumar2003/KubeGenius/blob/main/LICENSE)

---

## ✨ Overview
KubeGenius combines modern AI techniques with Kubernetes to deliver:
- **Predictive autoscaling** using LSTM‑based traffic forecasting.
- **Real‑time observability** of CPU, memory, and pod metrics.
- **Intelligent scaling decisions** that proactively adjust replica counts before demand spikes.
- **Secure, enterprise‑grade authentication** via Clerk (Google/GitHub SSO, email/password).

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, `@clerk/clerk-react`
- **Backend**: FastAPI (Python), WebSocket, SQLAlchemy
- **Machine Learning**: TensorFlow, LSTM neural networks
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker, Docker‑Compose, Kubernetes, Helm, Terraform

## 📦 Installation
```bash
# Clone the repository
git clone https://github.com/Abhinav-kumar2003/KubeGenius.git
cd KubeGenius

# Create a local environment file for Clerk credentials
cat > .env.local <<EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
EOF

# Start the full stack with Docker Compose
docker-compose up -d
```
The services will be available at:
- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

## 🚀 Quick Start
1. **Open the dashboard** (http://localhost:5173) and sign in with your Clerk account.
2. **Navigate to the "Autoscaling" tab** to view AI‑predicted traffic curves.
3. **Adjust scaling policies** if you wish to fine‑tune the behaviour.

## 🤝 Contributing
We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs or feature requests.
- Submitting pull requests.
- Code style and testing requirements.

## 📜 License
Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---
*Made with ❤️ by the KubeGenius team.*
