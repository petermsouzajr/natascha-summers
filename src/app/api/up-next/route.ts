import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { upNextSchema } from "@/lib/validations";

export async function GET() {
  const items = await prisma.upNext.findMany({
    orderBy: { releaseDate: "asc" },
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
    const parsed = upNextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // ── Auto-cleanup: remove items older than 3 days ──────────────────
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find stale items (releaseDate set and more than 3 days past)
    const staleItems = await prisma.upNext.findMany({
      where: {
        releaseDate: { not: null, lt: threeDaysAgo },
      },
      select: { id: true },
    });

    if (staleItems.length > 0) {
      // Count items that are NOT stale (will remain after deletion)
      const totalCount = await prisma.upNext.count();
      const nonStaleCount = totalCount - staleItems.length;

      // Only delete if there will be other items left (the new one being
      // added counts, so nonStaleCount >= 0 is always safe when adding)
      if (nonStaleCount >= 0) {
        await prisma.upNext.deleteMany({
          where: { id: { in: staleItems.map((i: { id: number }) => i.id) } },
        });
        console.log(`[Up Next] Cleaned up ${staleItems.length} stale item(s).`);
      }
    }
    // ─────────────────────────────────────────────────────────────────

    const item = await prisma.upNext.create({
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        releaseDate: parsed.data.releaseDate as Date | null,
        hasCosplay: parsed.data.hasCosplay,
        details: parsed.data.details || null,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    console.error("Up Next error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong." },
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

  await prisma.upNext.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const parsed = upNextSchema.partial().safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.upNext.update({
      where: { id },
      data: parsed.data as any,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Up Next update error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
