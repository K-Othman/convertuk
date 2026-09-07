import type { Metadata } from "next";
import Link from "next/link";
import { categories, converters, type Category } from "@/lib/conversions";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Free UK Calculators & Converters | ConvertUK" },
  description: "Free UK calculators for salary after tax, contractor day rates, cups to grams and ml to tablespoons. Clear formulas, examples and instant results.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "Free UK Calculators & Converters | ConvertUK",
    description: "Calculate take-home hourly pay, day-rate income and kitchen conversions with instant results.",
    url: absoluteUrl("/"),
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME,
        url: absoluteUrl("/"), inLanguage: "en-GB",
      }).replace(/</g, "\\u003c") }} />
      {/* Hero */}
      <section className="mb-14">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {converters.length} live converters, more on the way
        </p>
        <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Free UK calculators & converters.
        </h1>
        <p className="mt-4 max-w-prose text-pretty text-lg leading-relaxed text-slate-600">
          Calculate your hourly pay after tax, turn a contractor day rate into annual
          income, or convert recipe measurements for a UK kitchen. {SITE_NAME}
          shows the assumptions behind each result, with no sign-up required.
        </p>
      </section>

      {/* Converters grouped by category */}
      <div className="space-y-12">
        {categories.map((category) => {
          const items = converters.filter((c) => c.category === category.id);
          if (items.length === 0) return null;
          return (
            <CategorySection
              key={category.id}
              id={category.id}
              label={category.label}
              blurb={category.blurb}
              items={items}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategorySection({
  id,
  label,
  blurb,
  items,
}: {
  id: Category;
  label: string;
  blurb: string;
  items: typeof converters;
}) {
  return (
    // scroll-mt keeps the heading clear of the sticky header when linked to.
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id={`${id}-heading`}
          className="text-xl font-semibold tracking-tight text-ink"
        >
          {label}
        </h2>
        <p className="hidden text-sm text-slate-500 sm:block">{blurb}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-ink group-hover:text-accent">
                  {item.title}
                </span>
                <span
                  aria-hidden
                  className="mt-0.5 font-mono text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                >
                  →
                </span>
              </span>
              <span className="mt-2 text-sm leading-relaxed text-slate-500 text-pretty">
                {item.valueLine}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
