"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { searchMovies } from "@/lib/tmdb";
import moviesData from "@/data/movies.json";

type SearchMovie = {
  id: number;
  title: string;
  year?: number;
  rating?: string;
  genre?: string;
  poster: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  overview?: string;
};

const FALLBACK_MOVIES: SearchMovie[] = moviesData.rows.flatMap((row) =>
  row.movies.map((m) => ({
    ...m,
    poster: m.poster,
  }))
);

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Debounce search by 500ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const apiResults = await searchMovies(query);

        if (apiResults.length > 0) {
          // Transform TMDB results
          const transformed = apiResults
            .slice(0, 12)
            .map((m: any) => ({
              id: m.id,
              title: m.title,
              year: m.release_date ? new Date(m.release_date).getFullYear() : null,
              rating: m.vote_average?.toFixed(1) || "N/A",
              genre: "Movie",
              poster: m.poster_path
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : "/placeholder-poster.png",
              poster_path: m.poster_path,
              release_date: m.release_date,
              vote_average: m.vote_average,
              overview: m.overview,
            }));
          setResults(transformed);
        } else {
          // Fallback to local search
          const localResults = FALLBACK_MOVIES.filter(
            (m) =>
              m.title.toLowerCase().includes(query.toLowerCase()) ||
              (m.genre && m.genre.toLowerCase().includes(query.toLowerCase()))
          ).slice(0, 12);
          setResults(localResults);
        }
      } catch (err) {
        console.error("❌ Search error:", err);
        setError("Search failed, using local data");
        // Fallback to local search
        const localResults = FALLBACK_MOVIES.filter(
          (m) =>
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            (m.genre && m.genre.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 12);
        setResults(localResults);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-navy/97 backdrop-blur-xl"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,240,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pt-24 sm:pt-32">
            <div className="flex items-center gap-3 border-b-2 border-cyan pb-4 shadow-glow-cyan">
              <Search className="h-6 w-6 text-cyan" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, genres, transmissions..."
                className="w-full bg-transparent font-display text-xl text-white placeholder:text-white/30 focus:outline-none sm:text-2xl"
              />
              <button
                onClick={onClose}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-white/20 text-white/60 transition-colors hover:border-magenta hover:text-magenta"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 flex-1 overflow-y-auto pb-16">
              {query.trim() === "" && (
                <p className="font-mono text-xs uppercase tracking-widest text-white/30">
                  Start typing, or press esc to close
                </p>
              )}

              {loading && query.trim() !== "" && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
                  <p className="font-mono text-sm text-white/60">Searching...</p>
                </div>
              )}

              {!loading && query.trim() !== "" && results.length === 0 && (
                <p className="font-mono text-sm text-white/40">
                  No transmissions found for "{query}"
                </p>
              )}

              {error && (
                <p className="font-mono text-xs text-magenta">
                  ⚠️ {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {results.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex cursor-pointer flex-col gap-2 border border-white/10 bg-white/[0.02] p-2 transition-all hover:border-cyan hover:shadow-glow-cyan"
                  >
                    <div className="relative h-28 w-full flex-shrink-0 overflow-hidden bg-navy-light">
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <p className="truncate font-display text-xs font-medium text-white group-hover:text-cyan sm:text-sm">
                        {movie.title}
                      </p>
                      <p className="font-mono text-[9px] text-white/50 sm:text-[10px]">
                        {movie.year && `${movie.year} · `}
                        {movie.genre} · ★ {movie.rating}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
