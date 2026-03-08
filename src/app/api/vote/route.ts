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

    const { contentId, voteType } = parsed.data;

    const content = await prisma.contentSuggestion.findUnique({
      where: { id: contentId, status: "approved" },
    });

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Content not found or not approved" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${voteType === "up" ? "Upvote" : "Downvote"} – ${content.title}`,
              description: `Cast a ${voteType === "up" ? "👍" : "👎"} vote for "${content.title}"`,
            },
            unit_amount: 100, // £1.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        contentId: String(contentId),
        voteType,
        userId: user.userId,
      },
      success_url: `${appUrl}/requests?tab=${content.type}&success=true`,
      cancel_url: `${appUrl}/requests?tab=${content.type}&cancelled=true`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create payment session." },
      { status: 500 }
    );
  }
}
