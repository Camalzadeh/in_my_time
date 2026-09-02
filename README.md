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
  <a href="#testing">Testing</a> •
  <a href="#realtime">Realtime</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-routes">API Routes</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## About

**InMyTime** is a collaborative scheduling and polling application built with **Next.js (App Router)** and **MongoDB**.  
Users can create polls, propose multiple time slots, share links, and collect votes.  
The system aggregates availability to highlight the best meeting times for everyone.  
Realtime updates are powered by **Ably**.

Live at **[inmytime.me](https://inmytime.me)**.

---

## Documentation

The project's detailed presentation, roadmap, and core concepts are available in the dedicated documentation file.

* **Project Presentation:** View the full presentation in PDF format [here](presentation.pdf).

---

## Getting Started

```bash
git clone https://github.com/Camalzadeh/in_my_time.git
cd in_my_time

# --legacy-peer-deps is required: @ably-labs/react-hooks declares peer
# dependencies on React 18, and this project runs React 19.
npm ci --legacy-peer-deps

cp .env.example .env.local   # then fill in the values
npm run dev
```

The app is served on <http://localhost:3000>.

A MongoDB connection is needed for anything beyond the landing page — creating a poll, opening a
poll link and voting all talk to the database. The landing page is static and renders without one.

---

## Environment Variables

Copy [.env.example](.env.example) to `.env.local` for local development, and set the same
variables in your hosting provider for production.

| Variable | Required | Used by | What happens without it |
|----------|----------|---------|-------------------------|
| `MONGODB_URI` | yes | [lib/mongodb.ts](lib/mongodb.ts) | Every API route returns 500 |
| `ABLY_API_KEY` | for realtime | [app/api/ably/route.ts](app/api/ably/route.ts) | `/api/ably` returns 500; votes appear only after a reload |

`MONGO_URI` is accepted as an alias for `MONGODB_URI` — the code originally read that name and
existing deployments still set it.

---

## Features

- Create polls with multiple time slots  
- Anonymous voting (no login required)  
- Aggregated availability calculation  
- Shareable poll links  
- Live results visualization with realtime updates (Ably)  
- Modern UI with Tailwind + Framer Motion  
- CI/CD integration with GitHub Actions  

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | ![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white) Next.js (App Router) |
| Language     | ![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white) TypeScript |
| Database     | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) MongoDB + Mongoose |
| Frontend     | ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) React |
| Styling      | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) Tailwind CSS |
| Animations   | ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF.svg?style=for-the-badge&logo=framer&logoColor=white) Framer Motion |
| Realtime     | ![Ably](https://img.shields.io/badge/Ably-EA5C5C.svg?style=for-the-badge&logo=ably&logoColor=white) Ably |
| Testing      | ![Jest](https://img.shields.io/badge/Jest-C21325.svg?style=for-the-badge&logo=jest&logoColor=white) + @testing-library |
| Linting      | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white) ESLint |

---

## Usage

1. Create a poll with a title and time slots  
2. Share the unique poll link with participants  
3. Collect votes anonymously  
4. Finalize the poll to confirm the chosen time  

---

## Testing

```bash
npm run test:unit   # pure functions, no database, no network
npm run test:int    # API and model tests
npm test            # both
```

The integration tests do not need a real MongoDB: `@shelf/jest-mongodb` starts an in-memory
server. The first run downloads a MongoDB binary, so it takes noticeably longer than later ones.

---

## Realtime

Live updates do **not** originate in this codebase. `POST /api/polls/:id/vote` writes to MongoDB
and returns — nothing here publishes to Ably. The publish happens in Atlas:

```
   vote written to  inmytime.polls
            |
            v
   Atlas Database Trigger  "AblyInMyTime"
   watches INSERT / UPDATE / REPLACE / DELETE, full_document: true
            |
            v
   POST https://rest.ably.io/channels/poll-<pollId>-updates/messages
        { name: "db-update", data: <the whole poll document> }
            |
            v
   useChannel("poll-<pollId>-updates")   -- lib/hooks/use-poll-realtime.ts
```

Three things have to be in place, and only the first lives in this repository:

| Piece | Where it lives | Symptom when missing |
|-------|----------------|----------------------|
| `ABLY_API_KEY` | app environment | `/api/ably` returns 500; the browser never subscribes |
| The trigger function's own Ably key | Atlas App Services | writes never reach the channel |
| The `AblyInMyTime` trigger | Atlas App Services | same |

In every case the vote is still saved — it just does not appear on other people's screens until
they reload, which is why a broken trigger is easy to miss.

### Things worth knowing before you touch it

**The trigger is bound to one cluster in one Atlas project.** Moving the database to another
cluster or project does not carry it over; it has to be recreated there, pointed at the new data
source. Nothing in this repository does that for you.

**It is invisible in the default API listing.** Triggers created from the Atlas UI belong to an
App Services app with `product=atlas`, so `GET /groups/{groupId}/apps` returns an empty list and
only `GET /groups/{groupId}/apps?product=atlas` shows it.

**The database and collection names are part of the trigger config** (`inmytime.polls`). A
connection string pointing at a different database will work for the app and silently break
realtime.

**The Ably key is currently hardcoded in the trigger function's source.** It should be an App
Services Secret referenced through `context.values`. Until then, anyone who can read the function
can read the key.

**The function assumes `changeEvent.fullDocument` exists**, but a DELETE event does not carry one.
The app has no delete endpoint today, so it never fires; adding one would make the trigger throw
and, after repeated failures, Atlas can suspend it.

---

## Deployment

Production runs on **Vercel**, deployed by Vercel's own GitHub integration: every push to `main`
is built and released by Vercel directly, with no workflow in this repository. Runtime
environment variables come from the Vercel project settings.

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs lint, tests and a build on pull
requests and on pushes to `main` and `features/**`. It deploys nothing. Add `[no ci-cd]` or
`[no ci]` to a commit message to skip it.

A [Dockerfile](Dockerfile) is kept for self-hosting, but no pipeline builds it any more:

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

- **POST /api/polls** — Create a new poll  
- **GET /api/polls/:id** — Get poll details by ID  
- **POST /api/polls/:id/vote** — Add a vote to a specific slot  
- **POST /api/polls/:id/finalize** — Finalize a poll  
- **GET /api/ably** — Issue a short-lived Ably token for the browser  

See [requests.http](requests.http) for ready-made example requests.

---

## Project Structure

```
in_my_time/
├── app/                # Next.js App Router pages & API routes
│   ├── api/            # Backend API endpoints (polls, votes, ably)
│   └── components/     # Page-level UI components
├── components/         # Shared UI primitives (shadcn/ui)
├── lib/                # Database connection, hooks, utilities
│   ├── data/           # Server- and client-side data access
│   ├── hooks/          # React hooks (poll manager, realtime, identity)
│   └── utils/          # Slot generation, date ranges, time helpers
├── models/             # Mongoose schemas
├── types/              # Shared TypeScript types
├── tests/              # Unit & integration tests
│   ├── unit/           # Pure functions, mocked I/O
│   └── integration/    # API and model tests against an in-memory MongoDB
├── public/             # Static assets (images, icons)
├── docs/               # Presentation and branding assets
├── .github/workflows/  # Lint, test and build on every push
├── Dockerfile          # Container image for self-hosting
└── .env.example        # Required environment variables
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

**Poll creation fails immediately with "Server error: Could not create poll."** `MONGODB_URI` is
not set in the environment the app actually runs in. On Vercel that is the project settings, not
the workflow file.

**Votes only show up after a manual reload.** The write succeeded and the publish did not — see
[Realtime](#realtime) for the three places that can break. Work backwards: the App Services logs
show whether the trigger fired at all, and the trigger function can be run by hand against a
made-up change event to test the Ably key without touching the database. If the trigger is not
even listed, remember that the default app listing hides it — ask for `?product=atlas`.

---

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---


<p align="center">
  Made with ❤️ for better scheduling
</p>
