import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  const type = req.nextUrl.searchParams.get("type") ?? "movie";

  if (!query.trim()) {
    return NextResponse.json({ success: true, data: [] });
  }

  const results = await prisma.contentSuggestion.findMany({
    where: {
      title: { contains: query, mode: "insensitive" },
      type,
      status: "approved",
    },
    include: { votes: true },
    take: 10,
  });

  const withNetVotes = results.map((s) => {
    const upvotes = s.votes.filter((v) => v.voteType === "up").length;
    const downvotes = s.votes.filter((v) => v.voteType === "down").length;
    return {
      id: s.id,
      title: s.title,
      type: s.type,
      posterUrl: s.posterUrl,
      netVotes: upvotes - downvotes,
    };
  });

  return NextResponse.json({ success: true, data: withNetVotes });
}
