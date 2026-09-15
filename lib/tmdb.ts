/**
 * TMDB API Service Layer
 * Centralized functions for fetching TMDB data
 */

type TrendingMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  media_type: string;
};

type SearchMovie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
};

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
};

const BASE_URL =
  process.env.NEXT_PUBLIC_TMDB_BASE_URL || "http://localhost:3000";

/**
 * Fetch trending movies from TMDB
 */
export async function fetchTrendingMovies(
  timeWindow: "day" | "week" = "week"
): Promise<TrendingMovie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/tmdb/trending?timeWindow=${timeWindow}`
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.details || error.error || "Failed to fetch trending movies"
      );
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    throw error;
  }
}

/**
 * Search movies by query string
 */
export async function searchMovies(query: string): Promise<SearchMovie[]> {
  if (!query.trim()) {
    throw new Error("Search query cannot be empty");
  }

  try {
    const res = await fetch(
      `${BASE_URL}/api/tmdb/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error("Failed to search movies");
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
}

/**
 * Fetch detailed information about a specific movie
 */
export async function fetchMovieDetails(
  movieId: number
): Promise<MovieDetails> {
  try {
    const res = await fetch(`${BASE_URL}/api/tmdb/movie/${movieId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch movie details");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
}

/**
 * Format TMDB poster URL
 * @param path - TMDB poster_path
 * @param size - w200, w500, w780, original (default: w500)
 */
export function getTmdbImageUrl(
  path: string | null,
  size: "w200" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) {
    return "/placeholder-poster.png"; // Fallback
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
