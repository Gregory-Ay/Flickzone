"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Plus, Star } from "lucide-react";
import { fetchMovieDetails, fetchSimilarMovies, getTmdbImageUrl } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
  tagline?: string;
};

type SimilarMovie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre?: string;
  rating?: string;
  year?: number;
};

export default function MoviePage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie details
        const movieData = await fetchMovieDetails(Number(movieId));
        setMovie(movieData);

        // Fetch similar movies
        const similarMovies = await fetchSimilarMovies(Number(movieId));
        const transformed = similarMovies.map((m: any) => ({
          id: m.id,
          title: m.title,
          poster_path: m.poster_path,
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "/placeholder-poster.png",
          vote_average: m.vote_average,
          release_date: m.release_date,
          rating: m.vote_average?.toFixed(1) || "N/A",
          year: m.release_date ? new Date(m.release_date).getFullYear() : null,
          genre: "Movie",
        }));
        setSimilar(transformed);
      } catch (err) {
        console.error("❌ Error loading movie:", err);
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
  }, [movieId]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-navy">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan" />
          <p className="font-mono text-sm text-white/60">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-navy px-6">
        <div className="text-center mb-6">
          <p className="font-mono text-sm text-magenta mb-4">❌ {error || "Movie not found"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-sm text-cyan hover:text-cyan/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "/placeholder-backdrop.png";

  const posterUrl = getTmdbImageUrl(movie.poster_path, "w500");

  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <main className="relative min-h-screen bg-navy">
      {/* Fixed top navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-navy via-navy/80 to-transparent px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-sm font-semibold text-white hover:text-cyan transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Backdrop hero */}
      <div className="relative h-96 overflow-hidden sm:h-[500px]">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-32 px-6 pb-24 sm:px-10 md:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl"
        >
          {/* Movie info grid */}
          <div className="grid gap-8 md:grid-cols-4">
            {/* Poster */}
            <div className="md:col-span-1">
              <div className="relative aspect-[2/3] overflow-hidden border border-cyan/40 shadow-glow-cyan">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-3 flex flex-col justify-center gap-6">
              {/* Tagline */}
              {movie.tagline && (
                <p className="font-mono text-xs tracking-widest text-magenta text-glow-magenta">
                  {movie.tagline}
                </p>
              )}

              {/* Title */}
              <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
                {movie.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 font-mono text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-cyan text-cyan" />
                  {movie.vote_average.toFixed(1)} / 10
                </span>
                <span>{releaseYear}</span>
                <span>·</span>
                <span>{runtime}</span>
                <span>·</span>
                <span className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="text-cyan">
                      {g.name}
                    </span>
                  ))}
                </span>
              </div>

              {/* Synopsis */}
              <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {movie.overview}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button className="clip-corner flex items-center gap-2 bg-cyan px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-navy shadow-glow-cyan-lg transition-transform hover:scale-[1.03] active:scale-95">
                  <Play className="h-4 w-4 fill-navy" />
                  Play Now
                </button>
                <button className="clip-corner flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-all hover:border-magenta/60 hover:text-magenta hover:shadow-glow-magenta">
                  <Plus className="h-4 w-4" />
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Similar movies section */}
        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-24 max-w-5xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="h-5 w-1 bg-cyan" />
              <h2 className="font-display text-2xl font-semibold tracking-wide">
                Similar Movies
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {similar.slice(0, 10).map((m) => (
                <Link key={m.id} href={`/movies/${m.id}`}>
                  <MovieCard
                    movie={{
                      id: m.id,
                      title: m.title,
                      year: m.year,
                      rating: m.rating,
                      genre: m.genre,
                      poster: m.poster,
                    }}
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
