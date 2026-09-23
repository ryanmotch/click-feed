import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

const bodySchema = z.object({
  listingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: "This listing is no longer available" },
      { status: 409 }
    );
  }

  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe is not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: listing.askingPriceCents,
          product_data: {
            name: listing.title,
            description: `${listing.store} · ${listing.kind === "GIFT_CARD" ? "Gift card" : "Receipt"}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/listing/${listing.id}?paid=1`,
    cancel_url: `${origin}/listing/${listing.id}?canceled=1`,
    metadata: { listingId: listing.id },
  });

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listing.id },
      data: { status: "PENDING" },
    }),
    prisma.payment.upsert({
      where: { listingId: listing.id },
      create: {
        listingId: listing.id,
        stripeSessionId: session.id,
        amountCents: listing.askingPriceCents,
        status: "pending",
      },
      update: {
        stripeSessionId: session.id,
        status: "pending",
      },
    }),
  ]);

  return NextResponse.json({ url: session.url });
}
