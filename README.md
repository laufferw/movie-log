# William's Watchlist

A personal movie log: search for films, add them to your list, and rate what
you've watched.

- **React + Vite** frontend with Tailwind CSS
- **Supabase** for sign-in and storage (schema in `supabase/migrations/`)
- **TMDB** for movie search, posters, and details
- Deployable to Vercel (`vercel.json`)

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

| Variable | Where to get it |
|----------|-----------------|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Your Supabase project's API settings |
| `VITE_TMDB_API_KEY` | A free API key from [themoviedb.org](https://www.themoviedb.org/settings/api) |

Apply `supabase/migrations/001_init.sql` to your Supabase database before first use.
