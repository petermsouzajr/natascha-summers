import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { searchTMDB } from "@/lib/tmdb";
import { suggestSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to suggest content" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = suggestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, type, firstname } = parsed.data;

    if (firstname) {
      return NextResponse.json(
        { success: false, message: "Request rejected" },
        { status: 400 }
      );
    }

    // Check if this was previously denied
    const existing = await prisma.contentSuggestion.findUnique({
      where: { title_type: { title, type } },
    });

    if (existing) {
      if (existing.status === "denied") {
        return NextResponse.json(
          {
            success: false,
            message: `"${title}" has already been reviewed and denied by the admin.`,
            code: "DENIED",
          },
          { status: 409 }
        );
      }
      if (existing.status === "approved" || existing.status === "pending") {
        return NextResponse.json(
          {
            success: false,
            message: `"${title}" is already in the system (status: ${existing.status}).`,
            code: "DUPLICATE",
          },
          { status: 409 }
        );
      }
    }

    // Fetch poster from TMDB for movies/shows
    let tmdbId: string | undefined;
    let posterUrl: string | undefined;

    if (type === "movie" || type === "show") {
      const tmdb = await searchTMDB(title, type);
      if (tmdb) {
        tmdbId = tmdb.tmdbId;
        posterUrl = tmdb.posterUrl;
      }
    }

    await prisma.contentSuggestion.create({
      data: {
        title,
        type,
        tmdbId,
        posterUrl,
        suggestedBy: user.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${title}" has been submitted for admin review!`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    console.error("Suggest error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
