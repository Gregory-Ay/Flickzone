import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

// Debug: Check if API key is set
if (!API_KEY) {
  console.warn(
    "⚠️ TMDB_API_KEY is not set. Add it to .env.local for the API to work."
  );
}

export async function GET(req: Request) {
  try {
    // Validate API key
    if (!API_KEY) {
      return NextResponse.json(
        {
          error: "TMDB_API_KEY is not configured",
          hint: "Add TMDB_API_KEY to .env.local (copy from .env.local.example)",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeWindow = searchParams.get("timeWindow") || "week";

    const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&language=en-US&page=1`;

    console.log(`📡 Fetching TMDB trending: ${timeWindow}`);

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ TMDB API error ${res.status}:`, errorText);
      throw new Error(
        `TMDB API error: ${res.status} - ${errorText.slice(0, 200)}`
      );
    }

    const data = await res.json();
    console.log(
      `✅ Successfully fetched ${data.results?.length || 0} trending movies`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching trending movies:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch trending movies",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
