# DellekesHub — Frontend ↔ Backend Koppeling (Design)

**Datum:** 2026-07-27
**Status:** Goedgekeurd door gebruiker

## Doel

De Nuxt 4 frontend volledig koppelen aan de NestJS backend zodat het platform production-ready is. Alle gemockte pagina's krijgen echte data, ontbrekende backend endpoints worden aangemaakt, bestaande bugs worden gefixt.

## Beslissingen (uit brainstorming)

- **Scope:** alles koppelen (home feeds, browse+filters, watchlist, profielen, settings, registratie, reviews, admin).
- **Streaming:** bestaande MP4 range-streaming behouden; geen HLS/transcoding.
- **Registratie:** invite-code verplicht (nieuwe invites module).
- **Hardening:** basis — CORS/trustedOrigins via env, bug fixes, nette foutafhandeling.
- **Favorieten:** aparte favorites module (niet gelijk aan watchlist).
- **Reviews UI:** op de media-detailpagina.
- **Dode admin-kaarten** (Search torrents, Server Folder Structure): blijven als placeholder.

## Backend — Fixes

1. Cursor-paginatie: `keyToPagination` accepteert ISO-datums (`z.coerce.date()`).
2. Slug-redirects in `WatchController`/`StaticController` krijgen `/api` prefix.
3. `getVideoDuration`: `return` na `reject(err)`.
4. Episode-nummering: fast-glob resultaten sorteren (deterministisch).
5. `limit` query-params valideren; 404 i.p.v. 500 bij missende stream/image/subtitle bestanden.
6. `GET /users/:username`: safe column select.
7. CORS + trustedOrigins via `FRONTEND_URL` env var.
8. Reviews: create voor alle ingelogde users, duplicaat → 409, `mediaId` bestaanscontrole.

## Backend — Nieuwe endpoints

### Genres
- `genres text[]` kolom op `Collection`; in create/update schemas.
- `GET /api/collections/genres` → `string[]` (distinct).
- `GET /api/collections/all?genre=` filter.

### Feeds (collections controller, vóór `:id` routes)
- `GET /api/collections/continue-watching` → `[{ collection, episodeId, currentTime, duration, percentage, updatedAt }]` (excl. finished).
- `GET /api/collections/trending` → `[{ collection, viewers }]`.
- `GET /api/collections/top-rated` → `[{ collection, averageRating, reviewCount }]`.

### Watchlist module (nieuw)
- Entity `WatchlistItem`: id, user_id (FK User CASCADE), collection_id (FK Collection CASCADE), addedAt; unique (userId, collectionId).
- `GET /api/watchlist` → `{ collections }` (hydrated met images, nieuwste eerst).
- `POST /api/watchlist/:collectionId` → idempotent toevoegen.
- `DELETE /api/watchlist/:collectionId`.

### Favorites module (nieuw)
- Zelfde patroon als watchlist op `/api/favorites`.
- `GET /api/users/:username/favorites` → favorieten van een user (publiek binnen platform).

### Collection detail flags
- `GET /api/collections/:id` bevat `inWatchlist` en `isFavorite` voor de ingelogde user.

### Invites module (nieuw)
- Entity `InviteCode`: id, code (unique), createdById, usedById, usedAt, createdAt.
- Admin: `GET/POST/DELETE /api/invites`.
- `POST /api/users/register` (`@AllowAnonymous`): `{ username, password, inviteCode }` → valideert invite, maakt user via better-auth server API (synthetisch email `<username>@dellekeshub.local`), markeert invite gebruikt; duplicaat → 409.

### Users
- `PATCH /api/users/me` → `{ name?, email?, avatarB64? }`.
- Admin: `PATCH /api/users/:id` (username, role), `DELETE /api/users/:id` (self-delete geblokkeerd).
- Wachtwoord wijzigen via better-auth `/api/auth/change-password`.

### Videos
- `GET /api/videos/:id` (sessie): video met subtitles, images, persons.

### Reviews
- `GET /api/reviews/:mediaId/summary` → `{ average, count, myReview }`.

## Frontend — Wijzigingen

### Fundament
- Fix Searchbar (`config` undefined), MediaCard/EpisodeCard thumbnails → `/api/static/images/:imageId`, watch stream-URL `/api` prefix.
- `useAuth` met `useState` sessie-caching (niet meer fetch per navigatie); Navbar-avatar uit sessie.
- `pickLocale()` helper voor localized strings.
- Verwijder dode `server/` Nitro-directory en legacy `tailwind.config.js`.

### Auth & gebruikers
- Login/register: foutafhandeling + loading; register via `/api/users/register` met invite code.
- Settings: echte data, profiel opslaan, avatar upload (base64), wachtwoord wijzigen.
- Profielen: echte user data + favorieten (eigen: `/api/favorites`, ander: `/api/users/:username/favorites`); mocks weg.

### Media-ervaring
- Home: drie echte feeds; HeroTrailer over echte items met trailer; lege rijen verbergen.
- Browse: echte collecties, werkend genre-filter, load-more met cursor.
- Watchlist pagina: echte data + verwijder-knop.
- Media detail: season-select fix, film-layout (movies waren blanco), watchlist/favoriet toggles, resume-knop, reviews-sectie (nieuw component).
- Watch pagina: prev/next episode, autoplay-next countdown, subtitle tracks, progress rapporteren (throttled 5s) + hervatten.

### Admin
- 20× render-bug fix, zoekfilter, EditUserModal opslaan, user verwijderen (confirm), invite-beheer sectie.

## Buiten scope

- HLS/adaptive streaming, transcoding pipeline.
- Torrent-zoeken, Server Folder Structure features.

## Verificatie

- Backend: `npm run build` + `npm run lint`.
- Frontend: `npm run build`.
- Prod deploy: `npm run db:generate` + `npm run db:migrate` (dev gebruikt `synchronize`).
