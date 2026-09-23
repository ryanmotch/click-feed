import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazily construct the Stripe client the first time a route actually needs
// it, rather than at module load / build time — this lets `next build` (and
// routes that don't touch Stripe) succeed even before STRIPE_SECRET_KEY is
// configured.
export function getStripe(): Stripe {
  if (cached) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment to accept payments."
    );
  }

  cached = new Stripe(secretKey, {
    apiVersion: "2026-08-26.dahlia",
  });
  return cached;
}
