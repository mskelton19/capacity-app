# Capacity Review

An internal engineering capacity planning tool for visualizing work allocation across teams over a multi-month timeline.

## What It Does

**Capacity Review** helps your org plan and track work across three engineering teams — PPCX, Mobile App, and Yard AI — over a configurable timeline (currently Mar–Aug 2026).

### Gantt-style roadmaps
Each team has a timeline view with draggable and resizable project bars. Projects can be marked "at risk" (dashed borders). Phase banners mark strategic milestones.

### Commitment grids
Per-engineer, per-month capacity tracking. Each cell cycles through: Available → Committed → Unknown → On Leave → Returning, with visual encoding for each state.

### Capacity summaries
Color-coded utilization indicators (open / some availability / limited / at capacity) derived from the commitment grid.

### Open Questions hub
Tracks unresolved decisions (strategic, technical, resourcing) with statuses: Needs Discussion → Being Discussed → Done. Questions can span multiple teams.

### Full View
Aggregated roadmap across all three teams with toggles to show/hide each.

## Teams

| Team | People | Projects |
|------|--------|----------|
| PPCX | 7 | 7 |
| Mobile App | 4 | 7 |
| Yard AI | 6 | 11 |

## Tech Stack

- **React 18** + Vite — frontend
- **Node.js + Express** — API server (serves the built frontend + REST API)
- **PostgreSQL** — state and auth storage
- Inline styles only, no CSS framework

## Architecture

The frontend is a React SPA built with Vite. In production it is served as static files by the Express server, which also provides the API.

**Auth:** email/password login issues a JWT stored in `localStorage`. Unauthenticated users get a read-only view; logged-in users can edit everything.

**State:** `TimelineContext` persists to `localStorage` immediately and syncs to the API (debounced 1.5s) when authenticated. On load, the API is fetched first; if unavailable, localStorage or in-code defaults are used.

**Drag-and-drop:** `useTrackDrag` supports mouse and touch, horizontal move/resize, and vertical row reordering.

```
server/
└── index.js          # Express: GET /api/state, PUT /api/state, POST /api/auth/login

src/
├── api/              # fetch wrappers for /api/state
├── components/       # Modals (TrackEdit, QuestionEdit, RangeEdit, Login)
├── context/          # TimelineContext, AuthContext
├── hooks/            # useTrackDrag, useMediaQuery
├── lib/              # api.js — fetch helper with JWT auth header
├── utils/            # Row layout algorithm, question status styling
├── App.jsx           # Shell, tab nav, header
├── FullView.jsx      # Aggregate roadmap
├── PPCXTeam.jsx
├── MobileAppTeam.jsx
└── YardAITeam.jsx

migrations/
└── init.sql          # Creates app_state and users tables

helm/
├── Chart.yaml        # bitnami/postgresql as a dependency
├── values.yaml
└── templates/        # Deployment, Service, Ingress, Secret
```

## Local Development

You need a local Postgres instance with the schema applied:

```bash
psql -U postgres -c "CREATE DATABASE capacity; CREATE USER capacity WITH PASSWORD 'dev';"
psql -U capacity -d capacity -f migrations/init.sql
```

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
# edit .env: set DB_PASSWORD and JWT_SECRET
```

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — API server
cd server && npm install && node index.js

# Terminal 2 — Vite dev server (proxies /api to localhost:3000)
npm install && npm run dev
```

Add an editor account:

```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
# then insert into the users table:
psql -U capacity -d capacity -c \
  "INSERT INTO users (email, password_hash) VALUES ('you@example.com', '\$2a\$10\$...');"
```

## Docker

```bash
docker build -t capacity-review .
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=capacity \
  -e DB_USER=capacity \
  -e DB_PASSWORD=dev \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  capacity-review
```

## Kubernetes / Argo

The app ships as a Helm chart with Bitnami PostgreSQL as a dependency. The migration (`migrations/init.sql`) runs automatically on first Postgres boot via `primary.initdb.scripts`.

```bash
# Fetch the postgres subchart
helm dependency update ./helm

# Install
helm install capacity-review ./helm \
  --set image.repository=your-registry/capacity-review \
  --set image.tag=latest \
  --set postgresql.auth.password=strongpassword \
  --set jwtSecret=$(openssl rand -hex 32)
```

To add editor accounts after deploy, exec into the Postgres pod:

```bash
kubectl exec -it \
  $(kubectl get pod -l app.kubernetes.io/name=postgresql -o name | head -1) \
  -- psql -U capacity -d capacity
```

```sql
INSERT INTO users (email, password_hash)
VALUES ('you@example.com', '$2a$10$...');
```

Key values to configure in `helm/values.yaml` or via `--set`:

| Value | Description |
|-------|-------------|
| `image.repository` | Container image registry path |
| `image.tag` | Image tag to deploy |
| `jwtSecret` | Random secret for JWT signing (`openssl rand -hex 32`) |
| `postgresql.auth.password` | Postgres password for the `capacity` user |
| `ingress.enabled` | Set `true` to expose via ingress |
| `ingress.host` | Hostname for the ingress rule |
