import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { seller: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">The feed</h1>
        <p className="text-sm text-neutral-500">
          Grocery receipts and gift cards posted by other users. Click one to pay
          the seller and claim it.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Nothing posted yet.{" "}
          <a href="/new" className="font-medium text-neutral-900 underline">
            Be the first to post a listing
          </a>
          .
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
