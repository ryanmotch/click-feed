import Link from "next/link";
import { formatCents } from "@/lib/format";
import type { Listing } from "@/generated/prisma/client";

type ListingWithSeller = Listing & { seller: { name: string } };

const statusStyles: Record<Listing["status"], string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-neutral-200 text-neutral-500",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabels: Record<Listing["status"], string> = {
  AVAILABLE: "Available",
  PENDING: "Payment in progress",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export function ListingCard({ listing }: { listing: ListingWithSeller }) {
  const savingsPct = Math.round(
    (1 - listing.askingPriceCents / listing.faceValueCents) * 100
  );

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {listing.kind === "GIFT_CARD" ? "Gift card" : "Receipt"} · {listing.store}
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-neutral-900">
            {listing.title}
          </h2>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[listing.status]}`}
        >
          {statusLabels[listing.status]}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-neutral-900">
            {formatCents(listing.askingPriceCents)}
          </p>
          <p className="text-xs text-neutral-400">
            face value {formatCents(listing.faceValueCents)}
            {savingsPct > 0 ? ` · ${savingsPct}% off` : ""}
          </p>
        </div>
        <p className="text-xs text-neutral-400">by {listing.seller.name}</p>
      </div>
    </Link>
  );
}
