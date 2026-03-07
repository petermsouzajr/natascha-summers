import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { contentId, voteType, userId } = session.metadata ?? {};

    if (!contentId || !voteType || !userId) {
      console.error("Missing metadata in webhook:", session.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      await prisma.vote.create({
        data: {
          contentId: Number(contentId),
          userId,
          voteType,
          paymentId: session.id,
        },
      });
    } catch (err) {
      console.error("Failed to record vote:", err);
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

// App Router reads raw body by default; no legacy config needed
