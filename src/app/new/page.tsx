"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"RECEIPT" | "GIFT_CARD">("GIFT_CARD");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      store: form.get("store"),
      kind,
      faceValueCents: Math.round(Number(form.get("faceValue")) * 100),
      askingPriceCents: Math.round(Number(form.get("askingPrice")) * 100),
      sellerName: form.get("sellerName"),
      sellerContact: form.get("sellerContact"),
      imageUrl: form.get("imageUrl"),
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create listing");
      }
      router.push(`/listing/${data.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold">Post a listing</h1>
      <p className="mt-1 text-sm text-neutral-500">
        List a grocery receipt (for a rebate/return) or an unused gift card.
        Buyers pay you directly through Stripe checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex gap-2">
          {(["GIFT_CARD", "RECEIPT"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                kind === option
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-600"
              }`}
            >
              {option === "GIFT_CARD" ? "Gift card" : "Receipt"}
            </button>
          ))}
        </div>

        <Field label="Title" name="title" placeholder="$50 Target gift card" required />
        <Field label="Store" name="store" placeholder="Target" required />
        <Field
          label="Description"
          name="description"
          placeholder="Optional details about the card or receipt"
          textarea
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Face value (USD)"
            name="faceValue"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="50.00"
            required
          />
          <Field
            label="Asking price (USD)"
            name="askingPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="45.00"
            required
          />
        </div>

        <Field label="Your name" name="sellerName" placeholder="Jordan" required />
        <Field
          label="Contact info (shown to buyer after payment)"
          name="sellerContact"
          placeholder="Venmo @jordan, or email"
        />
        <Field
          label="Image URL (optional)"
          name="imageUrl"
          placeholder="https://..."
        />

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post listing"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  type = "text",
  step,
  min,
  textarea,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  step?: string;
  min?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      ) : (
        <input
          name={name}
          type={type}
          step={step}
          min={min}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      )}
    </label>
  );
}
