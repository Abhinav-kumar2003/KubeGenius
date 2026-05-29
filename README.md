# KubeGenius 🚀

**AI‑powered Kubernetes predictive autoscaling & monitoring platform**

[![GitHub stars](https://img.shields.io/github/stars/Abhinav-kumar2003/KubeGenius?style=flat-square)](https://github.com/Abhinav-kumar2003/KubeGenius/stargazers)
[![License](https://img.shields.io/github/license/Abhinav-kumar2003/KubeGenius?style=flat-square)](https://github.com/Abhinav-kumar2003/KubeGenius/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Abhinav-kumar2003/KubeGenius/ci-cd.yml?branch=main&style=flat-square)](https://github.com/Abhinav-kumar2003/KubeGenius/actions)
[![Docker Pulls](https://img.shields.io/docker/pulls/abhinavkumar/kubegenius?style=flat-square)](https://hub.docker.com/r/abhinavkumar/kubegenius)

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview
KubeGenius leverages modern AI techniques to provide proactive autoscaling and deep observability for Kubernetes workloads. It forecasts traffic, adjusts replica counts before spikes, and offers real‑time dashboards for resource metrics.

---

## Features
- **Predictive autoscaling** – LSTM‑based traffic forecasting.
- **Real‑time observability** – CPU, memory, pod metrics visualized live.
- **Intelligent scaling policies** – Customizable rules with AI suggestions.
- **Secure authentication** – Clerk integration (Google/GitHub SSO, email/password).
- **Docker‑Compose & Kubernetes ready** – Seamless local dev and production deployments.

---

## Architecture
![Architecture Diagram](https://raw.githubusercontent.com/Abhinav-kumar2003/KubeGenius/main/docs/architecture.png)

*The diagram illustrates the interaction between the React frontend, FastAPI backend, TensorFlow model, PostgreSQL, Redis, and the Kubernetes cluster.*

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Clerk
- **Backend**: FastAPI (Python), WebSocket, SQLAlchemy
- **Machine Learning**: TensorFlow, LSTM neural networks
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker, Docker‑Compose, Kubernetes, Helm, Terraform

---

## Installation
```bash
# Clone the repo
git clone https://github.com/Abhinav-kumar2003/KubeGenius.git
cd KubeGenius

# Create .env.local for Clerk credentials
cat > .env.local <<EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
EOF

# Start all services with Docker Compose
docker-compose up -d
```
The services will be available at:
- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

---

## Quick Start
1. Open the dashboard (`http://localhost:5173`) and sign in with Clerk.
2. Navigate to the **Autoscaling** tab to view AI‑predicted traffic curves.
3. Adjust scaling policies if needed and watch the system react in real time.

---

## Contributing
We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs or feature requests.
- Submitting pull requests.
- Code style (run `npm run lint` and `npm run format`).

---

## License
Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

## Contact
- **GitHub**: [Abhinav-kumar2003](https://github.com/Abhinav-kumar2003)
- **Issues**: Open an issue on the repository.
- **Email**: mohitkrdutta2003@gmail.com


