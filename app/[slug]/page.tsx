import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allSlugs,
  categories,
  getConverter,
  relatedConverters,
} from "@/lib/conversions";
import { absoluteUrl } from "@/lib/site";
import ConverterTool from "./ConverterTool";

type PageProps = { params: { slug: string } };

// Pre-render every converter at build time (fully static / SSG).
export function generateStaticParams(): { slug: string }[] {
  return allSlugs().map((slug) => ({ slug }));
}

// Only the slugs above exist; anything else is a 404.
export const dynamicParams = false;

export function generateMetadata({ params }: PageProps): Metadata {
  const converter = getConverter(params.slug);
  if (!converter) return {};

  const url = absoluteUrl(`/${converter.slug}`);
  return {
    title: converter.metaTitle,
    description: converter.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: converter.metaTitle,
      description: converter.metaDescription,
      url,
      type: "website",
    },
  };
}

export default function ConverterPage({ params }: PageProps) {
  const converter = getConverter(params.slug);
  if (!converter) notFound();

  const category = categories.find((c) => c.id === converter.category);
  const related = relatedConverters(converter.slug);
  const updated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
  }).format(new Date(converter.updated));

  // FAQPage structured data for rich snippets.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: converter.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 sm:py-12">
      {/* JSON-LD: rendered into the DOM for crawlers, invisible to users. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="mb-7">
        {category ? (
          <Link
            href={`/#${category.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:text-accent"
          >
            {category.label}
          </Link>
        ) : null}
        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {converter.title}
        </h1>
        <p className="mt-3 max-w-prose text-pretty text-lg leading-relaxed text-slate-600">
          {converter.intro}
        </p>
      </header>

      {/* The tool */}
      <section aria-label="Converter" className="mb-12">
        <ConverterTool slug={converter.slug} />
      </section>

      {/* Long-form body copy */}
      <section className="mb-12 max-w-prose space-y-4">
        {converter.body.map((paragraph, i) => (
          <p
            key={i}
            className="text-pretty leading-relaxed text-slate-700"
          >
            {paragraph}
          </p>
        ))}
      </section>

      {/* Visible FAQ (mirrors the JSON-LD above) */}
      <section aria-labelledby="faq-heading" className="mb-12">
        <h2
          id="faq-heading"
          className="text-xl font-semibold tracking-tight text-ink"
        >
          Frequently asked questions
        </h2>
        <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
          {converter.faqs.map((faq) => (
            <div key={faq.q} className="py-4">
              <dt className="font-medium text-ink">{faq.q}</dt>
              <dd className="mt-1.5 max-w-prose text-pretty leading-relaxed text-slate-600">
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related converters (same category, internal links) */}
      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mb-10">
          <h2
            id="related-heading"
            className="text-xl font-semibold tracking-tight text-ink"
          >
            Related converters
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-colors hover:border-accent"
                >
                  <span className="font-medium text-ink group-hover:text-accent">
                    {item.title}
                  </span>
                  <span className="mt-1 text-sm text-slate-500 text-pretty">
                    {item.valueLine}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-slate-500">
        Last updated{" "}
        <time dateTime={converter.updated} className="font-medium text-slate-700">
          {updated}
        </time>
      </p>
    </article>
  );
}
