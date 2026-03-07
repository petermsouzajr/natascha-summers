const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
}

export async function searchTMDB(
  query: string,
  type: "movie" | "show"
): Promise<{ tmdbId: string; posterUrl: string } | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const endpoint = type === "movie" ? "movie" : "tv";
  const url = `${TMDB_BASE}/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-GB`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const first: TMDBResult = data.results?.[0];
  if (!first) return null;

  return {
    tmdbId: String(first.id),
    posterUrl: first.poster_path
      ? `${TMDB_IMAGE_BASE}${first.poster_path}`
      : "",
  };
}
