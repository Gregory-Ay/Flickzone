"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MovieRow from "@/components/MovieRow";
import SearchOverlay from "@/components/SearchOverlay";
import { fetchTrendingMovies } from "@/lib/tmdb";
import moviesData from "@/data/movies.json";

export type Movie = {
  id: number;
  title: string;
  year?: number;
  rating?: string;
  genre?: string;
  poster: string;
  backdrop?: string;
  trailerUrl?: string;
  tagline?: string;
  synopsis?: string;
  runtime?: string;
  genres?: string[];
  // TMDB fields
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  overview?: string;
};

type HeroData = {
  title: string;
  tagline: string;
  synopsis: string;
  year: number;
  runtime: string;
  rating: string;
  genres: string[];
  backdrop: string;
  trailerUrl: string;
};

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [heroMovie, setHeroMovie] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trending movies on mount
  useEffect(() => {
    async function loadTrendingMovies() {
      try {
        setLoading(true);
        setError(null);
        const movies = await fetchTrendingMovies("week");

        if (movies.length > 0) {
          // Transform TMDB data to our Movie type
          const transformedMovies = movies.map((m: any) => ({
            id: m.id,
            title: m.title,
            poster: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "/placeholder-poster.png",
            backdrop: m.backdrop_path
              ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`
              : moviesData.hero.backdrop,
            rating: m.vote_average?.toFixed(1) || "N/A",
            year: m.release_date ? new Date(m.release_date).getFullYear() : null,
            genre: "Movie",
            synopsis: m.overview || "",
            tagline: m.title,
            genres: ["Trending"],
            trailerUrl: moviesData.hero.trailerUrl, // Placeholder
          }));

          setTrendingMovies(transformedMovies);

          // Set first trending movie as hero
          if (transformedMovies[0]) {
            setHeroMovie({
              title: transformedMovies[0].title,
              tagline: transformedMovies[0].tagline || "Trending Now",
              synopsis: transformedMovies[0].synopsis || "A trending movie",
              year: transformedMovies[0].year || new Date().getFullYear(),
              runtime: "2h 18m",
              rating: String(transformedMovies[0].rating),
              genres: transformedMovies[0].genres || ["Movie"],
              backdrop: transformedMovies[0].backdrop || moviesData.hero.backdrop,
              trailerUrl: transformedMovies[0].trailerUrl || moviesData.hero.trailerUrl,
            });
          }
        } else {
          throw new Error("No movies found");
        }
      } catch (err) {
        console.error("❌ Error loading trending movies:", err);
        setError("Failed to load trending movies");
        // Fallback to mock data
        setHeroMovie(moviesData.hero);
        setTrendingMovies(
          moviesData.rows[0].movies.map((m) => ({
            ...m,
            poster: m.poster,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrendingMovies();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const accents: ("cyan" | "magenta")[] = ["cyan", "magenta", "cyan"];

  // Prepare movie rows with fallback to mock data
  const movieRows = trendingMovies.length > 0 
    ? [
        {
          id: "trending",
          title: "Trending Now",
          movies: trendingMovies.slice(0, 8),
        },
        ...moviesData.rows.slice(1), // Keep other rows from mock data
      ]
    : moviesData.rows;

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      
      {/* Show hero or loading state */}
      {loading && (
        <div className="relative grid min-h-[92vh] place-items-center border-b border-white/10">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan" />
            <p className="font-mono text-sm text-white/60">Loading trending movies...</p>
          </div>
        </div>
      )}

      {!loading && heroMovie && <Hero data={heroMovie} />}

      {error && (
        <div className="border-b border-white/10 bg-magenta/10 px-6 py-4 text-center font-mono text-sm text-magenta">
          ⚠️ {error} — Using mock data
        </div>
      )}

      <div className="relative z-10 pb-24 pt-4">
        {movieRows.map((row, i) => (
          <MovieRow
            key={row.id}
            title={row.title}
            movies={row.movies}
            accent={accents[i % accents.length]}
          />
        ))}
      </div>

      <footer className="border-t border-white/10 px-6 py-10 text-center font-mono text-[11px] uppercase tracking-widest text-white/30">
        FlickZone — signal never sleeps · live TMDB integration
      </footer>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </main>
  );
}
