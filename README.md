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

- **React 18** + Vite
- **Supabase** — auth and remote state storage (optional)
- Inline styles only, no CSS framework

## Architecture

State lives in `TimelineContext` and persists to **localStorage** immediately, then syncs to **Supabase** (debounced 1.5s) when authenticated.

Auth is handled via Supabase: unauthenticated users get a read-only view; logged-in users can edit everything. Drag-and-drop is handled by `useTrackDrag` with support for mouse and touch, horizontal move/resize, and vertical row reordering.

```
src/
├── api/              # Supabase CRUD
├── components/       # Modals (TrackEdit, QuestionEdit, RangeEdit, Login)
├── context/          # TimelineContext, AuthContext
├── hooks/            # useTrackDrag, useMediaQuery
├── lib/              # Supabase client
├── utils/            # Row layout algorithm, question status styling
├── App.jsx           # Shell, tab nav, header
├── FullView.jsx      # Aggregate roadmap
├── PPCXTeam.jsx
├── MobileAppTeam.jsx
└── YardAITeam.jsx
```

## Local Development

```bash
npm install
npm run dev
```

The app runs without Supabase configured — it falls back to in-code defaults and localStorage. All data is read-only in this mode.

To enable editing locally, copy `.env.example` to `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for full Supabase + Vercel setup instructions.
