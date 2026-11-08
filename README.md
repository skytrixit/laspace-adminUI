# Studio Admin — LA Space Interiors

The back-of-house panel for the marketing site: enquiries, the service
catalogue and the project portfolio, in the same palette and type as the
public pages.

```bash
npm install
npm run dev        # http://localhost:5174/admin/
npm run build      # type-checks, then emits dist/
npm run preview
```

## Environment

Copy `.env.example` to `.env` and adjust. Only `VITE_`-prefixed values reach
browser code, and they are baked in at build time, so a change means a rebuild.

| Variable | Default | What it does |
|---|---|---|
| `VITE_DEV_PORT` | `5174` | Dev server port |
| `VITE_API_PROXY_TARGET` | `http://localhost:4000` | Where the dev server forwards `/api` |
| `VITE_BASE_PATH` | `/admin/` | Where the panel is mounted. Sets Vite's `base`; the router's `basename` in `src/App.tsx` derives from it, so the two cannot drift |
| `VITE_API_BASE` | `/api` | Where the browser sends API calls. Same-origin in production, where the API serves the panel |

## Where things live

| Path | What it holds |
|---|---|
| `src/data/types.ts` | Domain types plus the status / state tone maps |
| `src/lib/authApi.ts` | The stubbed auth endpoint — the one file to swap |
| `src/store/auth.tsx` | Session state, and where it is persisted |
| `src/data/demo.ts` | Seed records — the three arrays an API would replace |
| `src/store/studio.tsx` | The only mutable state, and every mutation + toast |
| `src/styles/tokens.css` | Colour, type and layout tokens. Exact spec values |
| `src/styles/ui.module.css` | Shared primitives: panels, fields, buttons, chips, pills |
| `src/styles/form.module.css` | The two-column shell both forms are built on |
| `src/components/` | Shell, sidebar, header, toast, lead drawer, form controls |
| `src/pages/` | The six views, plus the login screen |

## Signing in

`/admin/login` is the only route outside the guard. Everything else redirects
there when there is no session, and hitting it with a session redirects back
to the dashboard.

The demo account the stub recognises:

```
studio@laspaceinteriors.in
laspace
```

`authenticate()` in `src/lib/authApi.ts` is a ~900ms delay and a string
compare. Point it at the real endpoint and throw `BadCredentials` on a 401 —
the login form already renders that as its error block, and nothing else
changes.

The session is a flag under `laspace_admin_session`, written to
`localStorage` when "Keep me signed in" is checked and `sessionStorage` when
it is not. Both reads and writes are wrapped, so a private window or blocked
site data signs the studio out rather than breaking the panel. Sign out lives
in the rail footer under the owner's name.

Nothing here is real security: the guard is client-side, and the session flag
is a boolean the browser owns. The API has to enforce access on every request
once it exists.

## Swapping in the API

`StudioProvider` seeds its three `useState` arrays from `src/data/demo.ts` and
nothing else reads that module. Replacing the seeds with a fetch, and each
mutation with a request plus a local update, needs no change in any view —
counts on the dashboard, the sidebar badges and the filter pills are all
derived from those arrays on render.

## Images

`public/uploads/` holds the six portfolio photographs (`R1-web.png` …
`R6-web.png`) and the wordmark, re-encoded from the marketing site's own
`public/images`. Project covers and gallery tiles are painted as
`background-image` on a `<div role="img">` rather than an `<img src>`, so the
browser's preload scanner never tries to fetch a templated path.

## Not built

No auth, no upload backend (the dropzones are visual), no charts, no light
theme. The panel is dark only.
