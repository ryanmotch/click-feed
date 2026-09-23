import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { HeaderNav } from "@/components/HeaderNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Click Feed",
  description: "Post grocery receipts and gift cards, get paid for them by other users.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <SessionProvider>
          <header className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <a href="/" className="text-lg font-semibold tracking-tight">
                🧾 Click Feed
              </a>
              <HeaderNav />
            </div>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
          <footer className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-400">
            Click Feed — demo marketplace. Payments run in Stripe test mode.
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
