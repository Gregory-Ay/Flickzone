import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export async function GET(
  req: Request,
  { params }: { params: { movieId: string } }
) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "TMDB_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { movieId } = params;

    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;

    console.log(`📡 Fetching TMDB movie details for ID: ${movieId}`);

    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ TMDB API error ${res.status}:`, errorText);
      throw new Error(`TMDB API error: ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ Successfully fetched movie: ${data.title}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching movie details:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
