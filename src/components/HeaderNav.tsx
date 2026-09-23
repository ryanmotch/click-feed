"use client";

import { useSession, signOut } from "next-auth/react";

export function HeaderNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-100" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Log in
        </a>
        <a
          href="/signup"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Sign up
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href="/new"
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        + Post a listing
      </a>
      <span className="text-sm text-neutral-500">{session.user?.name}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
      >
        Log out
      </button>
    </div>
  );
}
