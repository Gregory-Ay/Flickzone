import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export async function GET(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "TMDB_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Search query required (q parameter)" },
        { status: 400 }
      );
    }

    const url = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

    console.log(`📡 Searching TMDB for: "${query}"`);

    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ TMDB API error ${res.status}:`, errorText);
      throw new Error(`TMDB API error: ${res.status}`);
    }

    const data = await res.json();
    console.log(
      `✅ Found ${data.results?.length || 0} results for "${query}"`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error searching movies:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}
