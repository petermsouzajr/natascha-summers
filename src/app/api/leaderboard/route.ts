import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type SuggestionWithVotes = Awaited<
  ReturnType<typeof prisma.contentSuggestion.findMany<{ include: { votes: true } }>>
>[number];



export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "movie";

  const suggestions = await prisma.contentSuggestion.findMany({
    where: { status: "approved", type },
    include: { votes: true },
    orderBy: { createdAt: "asc" },
  });

  const withNetVotes = suggestions.map((s: SuggestionWithVotes) => {
    const upvotes = s.votes.filter((v) => v.voteType === "up").length;
    const downvotes = s.votes.filter((v) => v.voteType === "down").length;
    return {
      id: s.id,
      title: s.title,
      type: s.type,
      posterUrl: s.posterUrl,
      tmdbId: s.tmdbId,
      netVotes: upvotes - downvotes,
      upvotes,
      downvotes,
      createdAt: s.createdAt,
    };
  });

  withNetVotes.sort((a, b) => {
    if (b.netVotes !== a.netVotes) return b.netVotes - a.netVotes;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return NextResponse.json({
    success: true,
    data: withNetVotes.slice(0, 100),
  });
}
