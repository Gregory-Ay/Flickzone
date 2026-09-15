/**
 * TMDB API Service Layer - Extended
 * Additional functions for movie details
 */

type SimilarMovie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
};

/**
 * Fetch similar movies
 */
export async function fetchSimilarMovies(
  movieId: number
): Promise<SimilarMovie[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_TMDB_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/tmdb/movie/${movieId}/similar`);

    if (!res.ok) {
      throw new Error("Failed to fetch similar movies");
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
}
