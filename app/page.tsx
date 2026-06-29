import Link from "next/link";
import { categories, converters, type Category } from "@/lib/conversions";
import { SITE_NAME } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      {/* Hero */}
      <section className="mb-14">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {converters.length} live converters, more on the way
        </p>
        <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Converters with a twist.
        </h1>
        <p className="mt-4 max-w-prose text-pretty text-lg leading-relaxed text-slate-600">
          {SITE_NAME} handles the niche UK calculations a search box can&apos;t
          answer inline — the ones that need real tax bands, real ingredient
          densities, and a clear payoff. Every tool updates live as you type.
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
