# ⚡ NexusFlow

> **A Visual IoT Telemetry & Rule Engine — Build data pipelines with drag-and-drop, process high-velocity sensor streams, and trigger real-time alerts — all without writing code.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- ✅ **Visual drag-and-drop pipeline builder** — Design IoT data flows on a canvas using React Flow; no code required
- ✅ **MongoDB Time-Series for high-ingest data** — Native time-series collections optimized for high-velocity sensor streams
- ✅ **Real-time WebSocket streaming** — Live data pushed to connected clients with minimal latency
- ✅ **RxJS stream compiler** — Pipeline JSON graphs are compiled into reactive RxJS Observable chains at runtime
- ✅ **Live dashboard with Recharts** — Animated, real-time line charts and gauges for every active device
- ✅ **Mock sensor data generator** — Built-in simulator produces realistic sensor readings for instant demo & testing

---

## 🛠 Tech Stack

| Layer | Backend | Frontend |
|-------|---------|----------|
| **Runtime** | Node.js 18 | Vite + React 18 |
| **Framework** | Express 4 | React Router 6 |
| **Database** | MongoDB 7 (Time-Series) | — |
| **ODM** | Mongoose 7 | — |
| **Real-time** | ws (WebSocket) | Native WebSocket API |
| **Streams** | RxJS 7 | RxJS 7 |
| **Visuals** | — | React Flow, Recharts |
| **Styling** | — | Tailwind CSS |
| **HTTP Client** | Axios | Axios |
| **Logging** | Winston | — |
| **Containerization** | Docker / docker-compose | Docker / docker-compose |

---

## 🏗 Architecture

```
                        ┌─────────────────────────────────────────┐
                        │           NexusFlow Architecture         │
                        └─────────────────────────────────────────┘

  DATA INGESTION
  ══════════════

  ┌──────────┐     POST /api/ingest     ┌─────────────────┐     ┌──────────────────────┐
  │  Sensor  │ ──────────────────────▶  │  Ingestion API  │ ──▶ │  MongoDB Time-Series │
  │  Device  │                          │  (Express)      │     │  Collection          │
  └──────────┘                          └────────┬────────┘     └──────────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │  RxJS Subject   │ (in-process event bus)
                                        └────────┬────────┘
                                                 │
                                   ┌─────────────┴──────────────┐
                                   ▼                            ▼
                        ┌──────────────────┐         ┌──────────────────┐
                        │  Stream Compiler  │         │  WebSocket Server │
                        │  (Pipeline exec) │         │  (ws)             │
                        └──────────┬───────┘         └────────┬─────────┘
                                   │                           │
                                   ▼                           ▼
                        ┌──────────────────┐         ┌──────────────────┐
                        │  Alert Service   │         │  React Dashboard  │
                        │  (MongoDB Alert) │         │  (Recharts)       │
                        └──────────────────┘         └──────────────────┘


  PIPELINE BUILDER
  ════════════════

  ┌─────────────────┐    JSON Graph     ┌──────────────────┐    RxJS Observables
  │  React Flow     │ ───────────────▶  │  Stream Compiler │ ──────────────────▶ Alerts
  │  Canvas (UI)    │                   │  (server-side)   │
  └─────────────────┘                   └──────────────────┘
         │
         │  Nodes: SensorSource → MovingAverage → ThresholdFilter → Alert
         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  Node Types: SensorSource | MovingAverage | ThresholdFilter  │
  │             | RateOfChange | SMSAlert | WebhookTrigger        │
  └─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18 or higher | [nodejs.org](https://nodejs.org) |
| **MongoDB** | 5.0 or higher | Time-Series collections require 5.0+ |
| **npm / pnpm** | Latest | `npm` ships with Node; `pnpm i -g pnpm` to install pnpm |

---

## 🚀 Quick Start

### Windows PowerShell

Run these commands from the project folder to install dependencies and create the local environment file if needed:

```powershell
Set-Location .\server
npm install
Set-Location ..\client
npm install
Set-Location ..
if (-not (Test-Path .\server\.env)) { Copy-Item .\server\.env.example .\server\.env }
```

Make sure MongoDB is running. Then start the backend and frontend in separate PowerShell terminals, opened in the project folder:

```powershell
Set-Location .\server
npm run dev
```

```powershell
Set-Location .\client
npm run dev
```

Open http://localhost:5173.

### macOS / Linux

```bash
# 1. Clone & navigate
cd nexusflow

# 2. Install backend deps
cd server && npm install

# 3. Install frontend deps
cd ../client && npm install

# 4. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI

# 5. Start MongoDB (if local)
mongod

# 6. Start backend (in server/)
npm run dev

# 7. Start frontend (in client/)
npm run dev

# 8. Open http://localhost:5173
```

> **Tip:** The mock sensor generator starts automatically — you'll see live data flowing into your dashboard within seconds of startup.

---

## 🐳 Docker Quick Start

```bash
# Start everything with one command
docker-compose up --build

# Services:
#   MongoDB  → localhost:27017
#   Backend  → localhost:5000
#   Frontend → localhost:5173
```

---

## 📡 API Reference

### Ingestion

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/ingest` | Ingest a telemetry data point | `{ deviceId, value, unit?, tags? }` |
| `POST` | `/api/ingest/batch` | Ingest multiple data points | `[{ deviceId, value, unit?, tags? }]` |

### Telemetry

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/telemetry` | List telemetry records | `deviceId`, `from`, `to`, `limit` |
| `GET` | `/api/telemetry/devices` | List unique device IDs | — |
| `GET` | `/api/telemetry/stats` | Aggregated stats per device | `deviceId`, `from`, `to` |

### Pipelines

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/pipelines` | List all saved pipelines | — |
| `POST` | `/api/pipelines` | Create a new pipeline | `{ name, description, nodes, edges }` |
| `GET` | `/api/pipelines/:id` | Get pipeline by ID | — |
| `PUT` | `/api/pipelines/:id` | Update a pipeline | `{ name?, description?, nodes?, edges? }` |
| `DELETE` | `/api/pipelines/:id` | Delete a pipeline | — |
| `POST` | `/api/pipelines/:id/activate` | Activate (compile & run) pipeline | — |
| `POST` | `/api/pipelines/:id/deactivate` | Stop a running pipeline | — |

### Alerts

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/alerts` | List alerts | `severity`, `pipelineId`, `limit` |
| `DELETE` | `/api/alerts/:id` | Dismiss an alert | — |
| `DELETE` | `/api/alerts` | Clear all alerts | — |

---

## 🔩 Pipeline Node Types

Each pipeline is built by connecting **typed nodes** on the canvas. Here's what each does:

| Node Type | Category | Description |
|-----------|----------|-------------|
| **Sensor Source** | Source | Subscribes to the live RxJS telemetry stream for a specific `deviceId`. All data entering a pipeline originates here. |
| **Moving Average** | Transform | Buffers the last *N* readings (configurable window size) and emits the rolling arithmetic mean, smoothing noisy sensor data. |
| **Threshold Filter** | Filter | Passes only data points where the value exceeds (or falls below) a configured threshold. Acts as a conditional gate. |
| **Rate of Change** | Transform | Computes the per-second rate of change between consecutive readings. Useful for detecting sudden spikes or drops. |
| **SMS Alert** | Sink | When triggered, sends an SMS notification via a configured provider (Twilio-compatible). Carries message template and recipient. |
| **Webhook Trigger** | Sink | POSTs the triggering data point (plus metadata) to a configured external URL. Enables integration with any third-party system. |

---

## 📅 Development Plan

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | Project Setup & Core Infrastructure | Repo init, Express server, MongoDB Time-Series connection, basic ingestion endpoint, project structure |
| **Week 2** | Telemetry Ingestion & Storage | Telemetry model, batch ingestion, query API, Winston logging, mock data generator |
| **Week 3** | Pipeline Data Model & REST API | Pipeline CRUD routes, Mongoose schema (nodes/edges as Mixed), pipeline activation/deactivation endpoints |
| **Week 4** | Stream Compiler (RxJS Engine) | Graph → adjacency list, operator chaining (movingAverage, threshold, rateOfChange), pipeline execution runtime |
| **Week 5** | WebSocket Real-time Streaming | ws server setup, telemetry broadcast, pipeline alert push, client reconnect logic |
| **Week 6** | React Frontend — Routing & Dashboard | Vite project, Tailwind, React Router, dashboard page, Recharts real-time line chart, device selector |
| **Week 7** | Visual Pipeline Builder (React Flow) | Canvas page, custom node components, palette sidebar, edge connection logic, save/load from API |
| **Week 8** | Alerts UI & Integration | Alert list page, severity badges, real-time alert push via WebSocket, dismiss/clear actions |
| **Week 9** | Docker & Deployment | Dockerfiles (server + client), docker-compose with MongoDB, environment variable handling, production build |
| **Week 10** | Testing, Polish & Docs | Unit tests for stream compiler, E2E smoke tests, README, API docs, final UI polish |

---

## 📁 Project Structure

```
nexusflow/
├── README.md                    ← This file
├── docker-compose.yml           ← Multi-service container orchestration
├── .gitignore
│
├── server/                      ← Node.js / Express backend
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── .env                     ← Local config (git-ignored)
│   └── src/
│       ├── index.js             ← Entry point (Express + WS server)
│       ├── config/
│       │   └── db.js            ← MongoDB connection + Time-Series setup
│       ├── models/
│       │   ├── Telemetry.js     ← Time-Series schema
│       │   ├── Pipeline.js      ← Pipeline graph schema
│       │   └── Alert.js         ← Alert schema
│       ├── routes/
│       │   ├── ingestion.js     ← POST /api/ingest
│       │   ├── telemetry.js     ← GET  /api/telemetry
│       │   ├── pipelines.js     ← CRUD /api/pipelines
│       │   └── alerts.js        ← GET/DELETE /api/alerts
│       ├── services/
│       │   ├── streamCompiler.js← React Flow JSON → RxJS Observable chain
│       │   ├── telemetryStream.js← Shared RxJS Subject (event bus)
│       │   └── alertService.js  ← Alert creation + WebSocket push
│       ├── websocket/
│       │   └── wsHandler.js     ← WebSocket connection lifecycle
│       └── utils/
│           ├── mockDataGenerator.js ← Simulated sensor readings
│           └── logger.js        ← Winston logger instance
│
└── client/                      ← Vite + React frontend
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx             ← React entry point
        ├── App.jsx              ← Router + layout
        ├── api/
        │   └── nexusflow.js     ← Axios API client
        ├── hooks/
        │   └── useWebSocket.js  ← Real-time WS hook
        ├── pages/
        │   ├── Dashboard.jsx    ← Live telemetry dashboard
        │   ├── PipelineBuilder.jsx ← React Flow canvas
        │   └── Alerts.jsx       ← Alert management
        └── components/
            ├── pipeline/        ← Custom React Flow nodes
            ├── dashboard/       ← Chart + stat widgets
            └── ui/              ← Button, Badge, Card
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ using the MERN stack + RxJS + React Flow</p>
