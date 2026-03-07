import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { recentContentSchema } from "@/lib/validations";

export async function GET() {
  const items = await prisma.recentContent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = recentContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const item = await prisma.recentContent.create({
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        youtubeLink: parsed.data.youtubeLink || null,
        posterUrl: parsed.data.posterUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    console.error("Recent content error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 }
    );
  }

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID is required" },
      { status: 400 }
    );
  }

  await prisma.recentContent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
