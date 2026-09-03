<p align="center">
  <img src="docs/logo.png" alt="InMyTime Logo" width="150" />
</p>
<p align="center">
  <img src="docs/branding.png" alt="InMyTime branding" width="150" />
</p>

<p align="center">
  <strong>Find the perfect time for everyone</strong>
</p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#time-zones">Time Zones</a> •
  <a href="#ownership">Ownership</a> •
  <a href="#realtime">Realtime</a> •
  <a href="#testing">Testing</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-routes">API Routes</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## About

**InMyTime** is a collaborative scheduling app built with **Next.js (App Router)** and
**MongoDB**. You propose a set of days and hours, share one link, and everyone marks the slots
that suit them. The grid fills in as votes arrive, and the owner closes the poll on whichever
time wins.

Nobody needs an account — not the person creating the poll, not the people voting.

Live at **[inmytime.me](https://inmytime.me)**.

---

## Documentation

* **Project Presentation:** the full presentation in PDF form is [here](presentation.pdf).

---

## Getting Started

### With Docker

```bash
git clone https://github.com/Camalzadeh/in_my_time.git
cd in_my_time
docker compose up
```

That brings up the dev server on <http://localhost:3000> together with its own MongoDB, so no
database or connection string is needed. The first start installs dependencies and runs one
production build — see the note in [compose.yaml](compose.yaml) for why the build is needed.
`docker compose down -v` removes everything it created.

File watching does not cross a Windows bind mount, so after editing run
`docker compose restart web` (about 7 seconds).

Realtime is off unless you add an `ABLY_API_KEY` to `.env.local` — the site works either way.

### Without Docker

Node 22 and a MongoDB you can reach.

```bash
npm ci
cp .env.example .env.local   # then fill in MONGODB_URI
npm run dev
```

The landing page is static and renders without a database. Creating a poll, opening a poll link
and voting all need one.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Everything |
| `npm run test:unit` | Pure functions only, no database |
| `npm run test:int` | API and model tests against a real MongoDB |
| `npm run smoke` | End-to-end checks over HTTP against a running server |

---

## Environment Variables

Copy [.env.example](.env.example) to `.env.local` for local development, and set the same
variables in your hosting provider for production.

| Variable | Required | Used by | Without it |
|----------|----------|---------|------------|
| `MONGODB_URI` | yes | [lib/mongodb.ts](lib/mongodb.ts) | Every API route returns 500 after 5s |
| `ABLY_API_KEY` | no | [lib/realtime.ts](lib/realtime.ts), [app/api/ably/route.ts](app/api/ably/route.ts) | The site works; votes appear on reload instead of instantly, and the poll header reads "Offline" |
| `NEXT_PUBLIC_SITE_URL` | no | [app/layout.tsx](app/layout.tsx) | Open Graph URLs resolve against `https://inmytime.me` |

`MONGO_URI` is accepted as an alias for `MONGODB_URI` — the code originally read that name and
existing deployments still set it.

Under Docker, `MONGODB_URI` is supplied by [compose.yaml](compose.yaml) and points at the
container, so a stray Atlas string in `.env.local` cannot send development writes to production.

---

## Features

- Polls with any number of days and a configurable slot length
- Anonymous voting — no accounts anywhere
- A week-at-a-glance grid: one column per day, one row per slot
- Drag to select a range with a mouse; tap cells or whole rows and columns on touch
- Time zones handled explicitly, so a slot means the same moment to every participant
- Live updates through Ably, and a working site when Ably is not configured
- Ownership proved by an httpOnly token, not by anything the browser claims
- Light and dark themes, following the system by default
- Shareable links with Open Graph previews

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | ![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white) Next.js 16 (App Router) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white) TypeScript |
| Database | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) MongoDB + Mongoose |
| Frontend | ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) React 19 |
| Styling | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) Tailwind CSS 4 |
| Realtime | ![Ably](https://img.shields.io/badge/Ably-EA5C5C.svg?style=for-the-badge&logo=ably&logoColor=white) Ably |
| Validation | Zod |
| Themes / toasts | next-themes, Sonner |
| Testing | ![Jest](https://img.shields.io/badge/Jest-C21325.svg?style=for-the-badge&logo=jest&logoColor=white) Jest |
| Linting | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white) ESLint |

The dependency list is deliberately short. A shadcn scaffold once pulled in 28 Radix packages
plus recharts, cmdk, embla, vaul and others that were never imported; removing them also removed
the React 19 peer conflict that forced `--legacy-peer-deps` on every install.

---

## Usage

1. Create a poll: pick the days, the daily window, the slot length and the time zone
2. Share the link — the creator's browser keeps the ownership cookie
3. Everyone marks the slots they could make
4. Close the poll on the winning time

---

## Time Zones

A poll stores its own zone in `config.timezone` (an IANA name such as `Asia/Baku`), and that is
what its daily start and end times refer to. Slots are computed from wall-clock time in that zone
and stored as UTC instants; the page renders them back in the poll's zone and says so when the
viewer is somewhere else.

This matters more than it sounds. Slots used to be built with `date.setHours()`, which means
*the browser's* zone — so a participant in Baku and one in Berlin could both click "14:00", store
two different instants, and never see each other's votes.

All of the arithmetic lives in [lib/time/](lib/time/) with no date library behind it: `Intl`
already knows the tz database. [lib/time/zone.ts](lib/time/zone.ts) converts between wall-clock
time and instants, correcting across daylight-saving transitions;
[lib/time/slots.ts](lib/time/slots.ts) generates and labels slots.

---

## Ownership

There are no accounts, so ownership is a secret the server issues rather than a claim the browser
makes.

Creating a poll mints a random 128-bit token. Only its SHA-256 goes into the document
(`ownerTokenHash`); the token itself comes back as an httpOnly cookie, `imt_o_<pollId>`. Closing a
poll requires that cookie. The first vote from a browser works the same way, with
`imt_v_<pollId>`, and the poll owner may also clear anyone's vote.

No response contains either hash — [lib/data/serialize.ts](lib/data/serialize.ts) is the single
boundary that decides what leaves the server. There is no signing key to configure, because the
stored hash is the source of truth.

> Previously the owner was identified by `ownerId`, a UUID from the browser's localStorage that
> was also returned in the poll's public JSON. Anyone holding a poll link could read it and close
> someone else's poll.

---

## Realtime

`POST /api/polls/:id/vote` writes to MongoDB and then publishes what changed:

```
   vote written to  inmytime.polls
            |
            v
   lib/realtime.ts  ->  Ably REST
   channel  poll-<pollId>-updates
   event    "update"
   payload  { type: "vote", vote } | { type: "vote-cleared", voterId }
            | { type: "finalized", finalTime }
            |
            v
   useChannel(...)  --  app/components/poll/PollRealtimeBridge.tsx
            |
            v
   applyPollEvent   --  lib/poll-state.ts   (pure, unit-tested)
```

Publishing never throws. The vote is already committed by that point, so a failed publish means
other people see it on their next load — not that the request fails.

With `ABLY_API_KEY` unset, `/api/ably` answers 503, the browser never subscribes, and the poll
header reads "Offline" rather than "Live". Everything else works.

> This used to run in an Atlas App Services database trigger, outside this repository. That had
> the Ably key hard-coded in the function's source, crashed on delete events because
> `changeEvent.fullDocument` is absent there, and published the *entire* poll document on every
> change, so messages grew with the vote count. It also could not be versioned, tested or run
> locally. Every write already passes through these route handlers, so they publish directly and
> the trigger is no longer used — if one still exists on the cluster it should be deleted, or
> participants will receive each update twice.

---

## Testing

```bash
npm run test:unit   # pure functions, no database
npm run test:int    # API and model tests, real MongoDB
npm test            # both
npm run smoke       # end-to-end over HTTP, against a running server
```

Integration tests talk to a real MongoDB: the container next to the app under Docker, and a
service container in CI. `tests/setup-env.js` points them at a scratch database
(`MONGO_TEST_URI`), so running them never touches what you were clicking through in the browser.

> They used to mock `connectDB` and the model away entirely, which meant none of them could catch
> a race or a missing authorization check — and the `@shelf/jest-mongodb` preset downloaded a
> mongod binary on every cold cache while never actually being used.

[scripts/smoke.mjs](scripts/smoke.mjs) covers what only a real HTTP round trip can: that cookies
are set and enforced, that secrets stay out of responses, and that a stranger cannot close a poll.

---

## Deployment

Production runs on **Vercel**, deployed by Vercel's own GitHub integration: every push to `main`
is built and released by Vercel directly, with no workflow in this repository. Runtime
environment variables come from the Vercel project settings.

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs lint, tests and a build on pull
requests and on pushes to `main` and `features/**`. It deploys nothing. Add `[no ci-cd]` or
`[no ci]` to a commit message to skip it.

The [Dockerfile](Dockerfile) is kept for self-hosting. It builds with `output: "standalone"`, so
the image carries only the modules the server actually reaches, runs as a non-root user, and
declares a `HEALTHCHECK` — without one a pull-based deploy will call a container that boots but
cannot serve "healthy".

```bash
docker build -t in_my_time .
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e ABLY_API_KEY="..." \
  in_my_time
```

> Cloud Run, the GHCR image pipeline and the GitHub-Actions Vercel deployment were all removed in
> September 2026 — the Vercel action pinned an old CLI that the platform had stopped accepting,
> and nothing was consuming the GHCR images. Any leftover reference to
> `europe-west1-docker.pkg.dev`, `GCP_SA_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID` or
> `VERCEL_PROJECT_ID` is dead, and those repository secrets can be deleted.

---

## API Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `POST /api/polls` | Create a poll | Sets the `imt_o_<pollId>` ownership cookie |
| `GET /api/polls/:id` | Read a poll | Secrets stripped |
| `HEAD /api/polls/:id` | Does it exist? | 200 / 404 / 400, no body, no document read |
| `POST /api/polls/:id/vote` | Cast or change a vote | Sets `imt_v_<pollId>` on the first one |
| `DELETE /api/polls/:id/vote` | Clear a vote | Own vote, or any as the owner |
| `POST /api/polls/:id/finalize` | Close the poll | Owner cookie required |
| `GET /api/ably` | Short-lived Ably token | 503 when realtime is not configured |

Bad input is a 400 naming the field, never a 500. Slots that do not belong to the poll are
rejected. See [requests.http](requests.http) for ready-made requests.

---

## Project Structure

```
in_my_time/
├── app/
│   ├── api/                # Route handlers (polls, votes, finalize, ably)
│   ├── components/
│   │   ├── create/         # The poll creation form
│   │   ├── home/           # Landing page sections
│   │   ├── poll/           # The poll page: grid, footer, modals, realtime bridge
│   │   └── search/         # "Open a poll by ID"
│   ├── polls/[id]/         # Poll page + generateMetadata for link previews
│   ├── polls/create/
│   ├── error.tsx           # Error, empty and loading boundaries
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── providers.tsx       # Theme provider and toaster
│   └── globals.css         # Design tokens, light and dark
├── lib/
│   ├── auth/               # Ownership and vote tokens
│   ├── data/               # Serialization boundary, server and client loaders
│   ├── hooks/              # Poll manager, voter identity
│   ├── time/               # Time zones and slot generation
│   ├── mongodb.ts          # Cached connection
│   ├── poll-state.ts       # Realtime event reducer (pure)
│   ├── realtime.ts         # Ably publishing
│   └── validation.ts       # Zod schemas for every route
├── models/                 # Mongoose schema and limits
├── types/                  # Stored shapes
├── tests/
│   ├── unit/               # Pure functions
│   └── integration/        # Routes and model against a real MongoDB
├── scripts/smoke.mjs       # End-to-end HTTP checks
├── compose.yaml            # Development: app + MongoDB
├── Dockerfile              # Production image for self-hosting
└── .env.example
```

---

## Troubleshooting

**Every API route returns 500 after roughly 5 seconds, while the landing page still loads.** The
database is unreachable; the app is fine. The landing page is static, so it survives on its own.
Check, in order: `Network Access → IP Access List` covers the deployment (Vercel's egress
addresses are not fixed, so this normally has to be `0.0.0.0/0`); the cluster is not paused, which
Atlas does automatically to idle free clusters; and the connection string in the hosting
provider's own settings is current.

If all three look right, check whether the cluster is actually serving rather than merely listed
as existing. A cluster can sit in `UPDATING` indefinitely with its nodes dead — the honest test is
to resolve the SRV record `_mongodb._tcp.<host>` and open a TCP connection to port 27017 on each
shard host. Nodes that do not answer, or a shard hostname that no longer resolves at all, mean the
cluster is broken on Atlas's side and no setting you change will bring it back.

**Poll creation fails with "Could not create poll."** `MONGODB_URI` is not set in the environment
the app actually runs in. On Vercel that is the project settings, not the workflow file.

**The poll header says "Offline" and votes only appear after a reload.** `ABLY_API_KEY` is unset
or wrong. This is a supported state rather than a fault — nothing else is affected.

**Votes appear twice.** The old Atlas trigger is still publishing alongside the app. Delete the
`AblyInMyTime` trigger. Triggers created from the Atlas UI do not show up in the default API
listing; ask for `GET /groups/{groupId}/apps?product=atlas`.

**Closing a poll returns 403 for the person who created it.** The ownership cookie is gone —
cleared browser data, a different browser, or a private window. It cannot be recovered by design;
the hash in the database is all the server keeps.

**Times look an hour off.** Check `config.timezone` on the poll. Every slot is rendered in the
poll's zone, not the viewer's, and the sidebar says which one when they differ.

**A route nested under `/api/polls/[id]` 404s in development on Windows.** `next dev` cannot
descend into a directory whose name contains brackets when the source is on a Windows bind mount:
`/api/polls/[id]` resolves, but `/api/polls/[id]/vote` and `/finalize` are never registered. It is
the filesystem, not the bundler — the same tree served from the container's own disk works, and
both Turbopack and webpack behave the same way.

`next build` uses a different scanner and finds everything, so [compose.yaml](compose.yaml) runs a
build once before starting the dev server; the manifest it leaves in `.next` is what makes the
routes resolvable. If you hit this outside Docker, run `npm run build` once. Keeping the working
copy on a Linux filesystem (WSL2) avoids it altogether and makes file watching work too.

---

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Before opening one: `npm run lint`, `npm run typecheck` and `npm test` all have to pass — CI runs
the same three plus a build.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for better scheduling
</p>
