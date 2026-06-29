import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  // metadataBase lets Next resolve OpenGraph/canonical URLs from SITE_URL.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A growing set of UK converters with a twist — niche calculations a search box can't answer inline, from real after-tax hourly pay to cups-to-grams by ingredient.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

/** Compact brand mark — a monospace convert glyph in an emerald tile. */
function BrandMark() {
  return (
    <span
      aria-hidden
      className="grid h-7 w-7 place-items-center rounded-md bg-ink font-mono text-sm font-bold text-accent-bright shadow-display"
    >
      ⇄
    </span>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>

        <header className="border-b border-slate-200/70 bg-paper/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded-md"
              aria-label={`${SITE_NAME} home`}
            >
              <BrandMark />
              <span className="flex items-baseline gap-2">
                <span className="text-base font-semibold tracking-tight text-ink">
                  {SITE_NAME}
                </span>
                <span className="hidden text-xs text-slate-500 sm:inline">
                  {SITE_TAGLINE}
                </span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-accent hover:underline"
            >
              All converters
            </Link>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="mt-16 border-t border-slate-200/70">
          <div className="mx-auto max-w-3xl px-5 py-8 text-sm text-slate-500">
            <p className="flex items-center gap-2">
              <BrandMark />
              <span className="font-semibold text-ink">{SITE_NAME}</span>
            </p>
            <p className="mt-3 max-w-prose text-pretty">
              Free UK converters with a twist. Figures are provided for guidance
              only and use the tax-year constants noted on each page — always
              check official sources before making financial decisions.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              © {new Date().getFullYear()} {SITE_NAME}. All converters update
              live as you type.
            </p>
          </div>
        </footer>

        {/* GA4 — only loads in production-style builds; safe to leave in for now. */}
        <GoogleAnalytics gaId="G-ZNLHNVTTS7" />
      </body>
    </html>
  );
}