import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeWindow = searchParams.get("timeWindow") || "week";

    const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&language=en-US&page=1`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending movies" },
      { status: 500 }
    );
  }
}
