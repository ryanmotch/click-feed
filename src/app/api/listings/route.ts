import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createListingSchema } from "@/lib/validation";

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid listing", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.askingPriceCents > data.faceValueCents) {
    return NextResponse.json(
      { error: "Asking price can't be more than the face value" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description || null,
      store: data.store,
      kind: data.kind,
      faceValueCents: data.faceValueCents,
      askingPriceCents: data.askingPriceCents,
      sellerName: data.sellerName,
      sellerContact: data.sellerContact || null,
      imageUrl: data.imageUrl || null,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
