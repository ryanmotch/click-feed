import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

// Stripe needs the raw request body (untouched by any JSON parsing) to verify
// the webhook signature, which is why we call request.text() below instead
// of request.json().
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const listingId = session.metadata?.listingId;
      if (listingId) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { listingId },
            data: {
              status: "paid",
              stripePaymentIntentId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
              buyerEmail: session.customer_details?.email ?? null,
            },
          }),
          prisma.listing.update({
            where: { id: listingId },
            data: { status: "PAID" },
          }),
        ]);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const listingId = session.metadata?.listingId;
      if (listingId) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { listingId },
            data: { status: "expired" },
          }),
          prisma.listing.update({
            where: { id: listingId },
            data: { status: "AVAILABLE" },
          }),
        ]);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
