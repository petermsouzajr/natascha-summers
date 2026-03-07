import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { approveSchema } from "@/lib/validations";

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
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { suggestionId, action } = parsed.data;

    const suggestion = await prisma.contentSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      return NextResponse.json(
        { success: false, message: "Suggestion not found" },
        { status: 404 }
      );
    }

    await prisma.contentSuggestion.update({
      where: { id: suggestionId },
      data: { status: action },
    });

    return NextResponse.json({
      success: true,
      message: `Suggestion "${suggestion.title}" has been ${action}.`,
    });
  } catch (err) {
    console.error("Approve error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
