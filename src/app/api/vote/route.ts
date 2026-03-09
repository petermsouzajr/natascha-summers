import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { voteSchema } from "@/lib/validations";


export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });


  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to vote" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { contentId, voteType, count = 1 } = parsed.data;

    const content = await prisma.contentSuggestion.findUnique({
      where: { id: contentId, status: "approved" },
    });

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Content not found or not approved" },
        { status: 404 }
      );
    }

    // We create multiple records to maintain history.
    // Each needs a unique paymentId due to schema constraints.
    await prisma.$transaction(
      Array.from({ length: count }).map(() =>
        prisma.vote.create({
          data: {
            contentId,
            userId: user.userId,
            voteType,
            paymentId: `OFFLINE_${Math.random().toString(36).substring(2, 15)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully cast ${count} ${voteType}${count > 1 ? "s" : ""}!`
    });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to process vote." },
      { status: 500 }
    );
  }
}
