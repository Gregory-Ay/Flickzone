# FlickZone

A futuristic, cyberpunk-themed movie streaming UI built with Next.js 14, Tailwind CSS, Framer Motion, and shadcn-style primitives.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — deep navy (`#070B1A`) base with electric cyan (`#00F0FF`) and magenta (`#FF00C8`) accents, zero border-radius, angular clip-path corners
- **Framer Motion** — hero entrance choreography, 3D card tilt, search overlay transitions
- **lucide-react** icons
- **TMDB API** — Real movie data integration

## Features

- Split-screen hero with autoplaying muted trailer
- Floating pill navbar with glow-on-hover nav items
- Three horizontal movie rows ("Hype Now", "Sci-Fi Picks", "Action Binge") with neon-bordered scrollers and arrow nav
- Movie cards with 3D tilt-on-hover, neon outline, and a quick-info popup (rating, genre, play/add actions)
- Full-screen search overlay — open with the search icon or **Ctrl+K** / **⌘K**, closes with **Esc**
- Fully responsive: stacked mobile layout, grid/row desktop layout
- **Real movie data from TMDB API** — trending movies, search functionality

## Getting started

### 1. Get a TMDB API Key

- Sign up (free) at [TMDB](https://www.themoviedb.org/)
- Go to [TMDB Settings → API](https://www.themoviedb.org/settings/api) and generate your API key

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your TMDB API key:

```env
TMDB_API_KEY=your_api_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/tmdb/              # TMDB API routes
    trending/route.ts    # Fetch trending movies
    search/route.ts      # Search movies
    movie/[movieId]/     # Fetch movie details
  layout.tsx             # Root layout + fonts (Chakra Petch + Inter)
  page.tsx               # Page composition + Ctrl+K listener
  globals.css            # Grid background, glow utilities, scrollbar theme
components/
  Navbar.tsx
  Hero.tsx
  MovieRow.tsx
  MovieCard.tsx
  SearchOverlay.tsx
lib/
  utils.ts               # cn() helper (clsx + tailwind-merge)
  tmdb.ts                # TMDB API service layer
data/
  movies.json            # Mock data (fallback when API unavailable)
```

## API Routes

### GET `/api/tmdb/trending?timeWindow=week`
Fetch trending movies. Supports `timeWindow` query param: `day` or `week`.

### GET `/api/tmdb/search?q=query`
Search movies by title. Requires `q` query parameter.

### GET `/api/tmdb/movie/[movieId]`
Fetch detailed information about a specific movie.

## TMDB Service Layer

Use the `lib/tmdb.ts` helpers in your components:

```tsx
import { fetchTrendingMovies, searchMovies, fetchMovieDetails, getTmdbImageUrl } from '@/lib/tmdb';

// Fetch trending
const trending = await fetchTrendingMovies('week');

// Search
const results = await searchMovies('Inception');

// Get details
const movie = await fetchMovieDetails(550);

// Format image URL
const posterUrl = getTmdbImageUrl(movie.poster_path, 'w500');
```

## Troubleshooting

### API returns 500 error

1. Check `.env.local` exists and `TMDB_API_KEY` is set
2. Verify your API key is correct at [TMDB](https://www.themoviedb.org/settings/api)
3. Check server logs: `npm run dev` should show debug output

### No movies appear

1. Open browser DevTools → Network tab
2. Check if `/api/tmdb/trending` request succeeds (200 status)
3. Check console for error messages

## Notes

- Poster art uses real TMDB images. `next.config.js` whitelists `image.tmdb.org`
- All TMDB requests are cached server-side (1 hour for trending, 30 mins for search, 24 hours for details)
- Mock data in `data/movies.json` serves as fallback

## References

- [TMDB API Docs](https://developer.themoviedb.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Framer Motion](https://www.framer.com/motion/)
