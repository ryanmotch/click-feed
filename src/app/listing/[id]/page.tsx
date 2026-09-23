import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { PayButton } from "@/components/PayButton";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
}) {
  const { id } = await params;
  const { paid, canceled } = await searchParams;

  const [listing, session] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: { name: true } } },
    }),
    auth(),
  ]);
  if (!listing) notFound();

  const showSellerContact = listing.status === "PAID";
  const isOwnListing = session?.user?.id === listing.sellerId;

  return (
    <div className="mx-auto max-w-lg">
      {paid && listing.status === "PAID" && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment received! The seller&apos;s contact info is below so you can
          arrange handoff.
        </div>
      )}
      {canceled && (
        <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Checkout was canceled. You can try again below.
        </div>
      )}

      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {listing.kind === "GIFT_CARD" ? "Gift card" : "Receipt"} · {listing.store}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{listing.title}</h1>

      {listing.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="mt-4 max-h-80 w-full rounded-lg object-cover"
        />
      )}

      {listing.description && (
        <p className="mt-4 text-sm text-neutral-600">{listing.description}</p>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-500">Asking price</span>
          <span className="text-2xl font-bold">{formatCents(listing.askingPriceCents)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-sm text-neutral-400">
          <span>Face value</span>
          <span>{formatCents(listing.faceValueCents)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-sm text-neutral-400">
          <span>Posted by</span>
          <span>{listing.seller.name}</span>
        </div>
      </div>

      <div className="mt-4">
        {listing.status === "AVAILABLE" && isOwnListing && (
          <p className="rounded-md bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-500">
            This is your own listing.
          </p>
        )}
        {listing.status === "AVAILABLE" && !isOwnListing && !session && (
          <a
            href={`/login?callbackUrl=/listing/${listing.id}`}
            className="block w-full rounded-md bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
          >
            Log in to pay
          </a>
        )}
        {listing.status === "AVAILABLE" && !isOwnListing && session && (
          <PayButton listingId={listing.id} />
        )}
        {listing.status === "PENDING" && (
          <p className="rounded-md bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            A payment is in progress for this listing.
          </p>
        )}
        {listing.status === "PAID" && !paid && (
          <p className="rounded-md bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-500">
            This listing has already been paid for.
          </p>
        )}
        {listing.status === "CANCELLED" && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            This listing was cancelled.
          </p>
        )}
      </div>

      {showSellerContact && listing.sellerContact && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-medium">Seller contact</p>
          <p className="mt-1">{listing.sellerContact}</p>
        </div>
      )}
    </div>
  );
}
