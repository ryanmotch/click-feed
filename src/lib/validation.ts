import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().trim().min(3, "Title needs at least 3 characters").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  store: z.string().trim().min(2, "Store name is required").max(80),
  kind: z.enum(["RECEIPT", "GIFT_CARD"]),
  faceValueCents: z.coerce.number().int().positive().max(100_000_00),
  askingPriceCents: z.coerce.number().int().positive().max(100_000_00),
  sellerName: z.string().trim().min(2, "Your name is required").max(80),
  sellerContact: z.string().trim().max(200).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
