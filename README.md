# Reelist: Movie Review & Watchlist Platform

A full-stack movie discovery and review platform. Users browse movies, build watchlists, rate and review films, organise collections, and get personal recommendations. Admins manage users, moderate reviews, and import movies from TMDB into a local library.

**Live demo:** https://movie-platform-97wq.vercel.app
**API health:** https://reelist-api.vercel.app/api/health

## Features

- **Movie discovery:** trending, now in theatres, coming soon, top rated, filters by genre, year, rating and sort order, title search, and "Load more" pagination.
- **Movie details:** overview, cast, director, runtime, genres, and a trailer that plays in an in-page popup.
- **Accounts:** register and log in with JWT, protected routes, profile editing, password change, account deletion, and session expiry handling.
- **Watchlist and watched history:** save movies, mark them watched, and remove them.
- **Ratings and reviews:** 1 to 5 stars with an optional written review. Users can edit and delete their own reviews. Reviewing a movie marks it as watched.
- **Collections:** create named collections, add or remove movies from the movie page or the collection page.
- **For you:** collaborative-filtering recommendations (cosine similarity on user ratings), with a popular-in-your-genre fallback for new users.
- **Activity and search history:** account ID, login history with IP and browser, recent searches, and an activity log.
- **Admin dashboard:** site statistics, user management, review moderation (hide, restore, delete), a chunked TMDB import into the movie library, and a manual digest trigger.
- **Weekly email digest:** trending and top-rated picks, with personal recommendations, sent by Vercel Cron. Requires SMTP to be configured.
- **Design:** dark and light themes, responsive layout from 320px upward, skeleton loaders, toast notifications, and accessible forms.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Tailwind CSS v4, Axios, Lucide icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (free tier) |
| Auth | JWT, bcrypt |
| Security | Helmet, CORS allowlist, rate limiting, input validation |
| Data source | TMDB API |
| Email | Nodemailer (SMTP) |
| Hosting | Vercel (frontend and backend), Vercel Cron |

## Project structure

```text
movie-platform/
├── client/                 React app (Vite)
│   └── src/
│       ├── components/     layout, movies, collections, admin, common
│       ├── context/        Auth, Theme, Toast
│       ├── pages/          one file per route
│       ├── services/       Axios instance
│       └── utils/
└── server/                 Express API
    ├── api/index.js        Vercel serverless entry point
    └── src/
        ├── controllers/    request handlers
        ├── middleware/     auth, activity logging, errors, store loader
        ├── routes/         API routes
        └── services/       database, TMDB client, recommendations, digest, seeder
```

## Run locally

Requirements: Node.js 20 or newer, and a MongoDB Atlas connection string (or a local MongoDB).

```bash
npm run install:all
cp server/.env.example server/.env
npm run dev
```

Open http://localhost:5173. Fill in `server/.env` with the values in the table below.

### Environment variables (`server/.env`)

| Name | Purpose |
|---|---|
| `JWT_SECRET` | Signs login tokens. At least 32 random characters. |
| `MONGO_URI` | MongoDB connection string. |
| `MONGO_DB` | Database name, for example `reelist-dev`. |
| `TMDB_API_KEY` | Free API key from themoviedb.org. |
| `CRON_SECRET` | Protects the digest endpoint. |
| `CLIENT_URL` | Allowed frontend origin for CORS. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional. Leave empty to log digests to the console instead. |

The frontend needs `VITE_API_URL` only in production. In development the Vite proxy forwards `/api` to the backend.

## Deployment

- **Backend:** deploy the `server` folder as a Vercel project. `api/index.js` is the entry point, and `vercel.json` routes all requests to it and schedules the daily digest cron.
- **Frontend:** deploy the `client` folder as a Vercel project and set `VITE_API_URL` to the backend URL followed by `/api`.
- Set every variable from the table above in the backend project's environment settings.

## Notes and limitations

- Movies are shown with details and trailers only. Full films are not streamed.
- Trailers are embedded from YouTube through the TMDB video data.
- The weekly digest only sends email when SMTP is configured.
- User data is stored in one MongoDB document. This suits a small to medium user base. A larger deployment would split it into separate collections.
- Free hosting may respond slowly after a period of inactivity.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.