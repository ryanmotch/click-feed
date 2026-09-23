import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewListingForm } from "@/components/NewListingForm";

export default async function NewListingPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/new");
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold">Post a listing</h1>
      <p className="mt-1 text-sm text-neutral-500">
        List a grocery receipt (for a rebate/return) or an unused gift card.
        Buyers pay you directly through Stripe checkout.
      </p>
      <NewListingForm />
    </div>
  );
}
