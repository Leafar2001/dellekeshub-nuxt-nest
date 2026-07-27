# DellekesHub Backend

NestJS 11 backend for DellekesHub. Uses **PostgreSQL** (TypeORM) for persistence and
**better-auth** (`@thallesp/nestjs-better-auth`) for authentication.

## Prerequisites

- Node.js 22+
- PostgreSQL 14+ (a database named `dellekeshub` by default)
- `ffmpeg` / `ffprobe` on the system `PATH` (used for duration probing and
  snapshot generation for indexed videos)

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable             | Description                                            |
| -------------------- | ----------------------------------------------------- |
| `PORT`               | HTTP port (default `8080`)                            |
| `DATABASE_URL`       | PostgreSQL connection string                          |
| `BETTER_AUTH_SECRET` | At least 32-char random secret (used by better-auth)   |
| `BETTER_AUTH_URL`    | Base URL of this backend, e.g. `http://localhost:8080`|
| `NODE_ENV`           | Set to `prod` for production (disables schema sync)   |

## Setup

```bash
npm install

# 1. Create the better-auth tables (user, session, account, verification,
#    plus the username-plugin columns and our custom role / avatarB64 fields)
npm run auth:migrate

#    (Dry-run: `npm run auth:generate` prints the equivalent SQL.)

# 2. (Development only) TypeORM auto-syncs the rest of the schema on startup.
#    For production, generate and run SQL migrations instead:
#    npm run db:generate -- src/migrations/Init
#    npm run db:migrate
```

## Running

```bash
# development (watch mode)
npm run start:dev

# production
npm run start:prod
```

The API is served on `http://localhost:<PORT>`. Authentication endpoints are
mounted under `http://localhost:<PORT>/api/auth/*` by better-auth.

## Project layout

```
src/
├── auth/             # better-auth instance + RolesGuard / @Roles decorator
├── users/            # User reads (better-auth owns writes)
├── person/           # People referenced by videos
├── videos/           # Video catalog + embedded images/subtitles/persons
├── collections/      # Collections (movie/series) + filesystem indexing
├── reviews/          # User reviews on a media (polymorphic)
├── watch-progress/   # Per-user playback progress (polymorphic media)
├── images/           # Image metadata (ffmpeg-generated snapshots)
├── stream/           # Video file streaming + static asset serving
├── lib/              # Shared utils, Zod helpers, project constants
├── data-source.ts    # TypeORM DataSource (CLI + migrations)
├── app.module.ts
└── main.ts
```

## Authorization

A global `AuthGuard` (registered by `@thallesp/nestjs-better-auth`) protects
every route by default. Use the following to control access:

- `@Session() session` — injects the better-auth session (`session.user`, etc.)
- `@AllowAnonymous()` — make a route public
- `@OptionalAuth()` — authentication optional
- `@Roles('admin')` + `@UseGuards(RolesGuard)` — require an admin role (reads
  `session.user.role`, the custom column on the `users` table)

## Notes

- `synchronize` is enabled when `NODE_ENV !== 'prod'` so TypeORM creates the
  application tables automatically. Keep it **off** in production.
- Localized strings (`title`, `slug`, `description`, `trailer`) are stored as
  JSONB columns shaped as `{ "en-US"?: string, "nl-NL"?: string }`.
- Reviews and watch-progress reference a media polymorphically via
  `media_id` + `media_type` (`'video' | 'collection'`); no foreign key is
  enforced at the database level — the app resolves the referenced entity.