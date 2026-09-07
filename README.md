# ConvertUK — free UK calculators and converters

A config-driven collection of niche UK converters — the calculations a search
box can't answer inline (real after-tax hourly pay, cups-to-grams by ingredient,
social-media safe zones, and more). Every converter is a single object in one
config file; a dynamic route renders any of them. Fully static (SSG), built for
Vercel.

## Stack

- **Next.js 14** (App Router) + **React 18**
- **TypeScript** (strict, no `any`)
- **Tailwind CSS 3**
- Local **Geist** Sans + Mono fonts (the mono drives the results "display")

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build (prerenders every converter as static HTML)
npm run start    # serve the production build
npm run lint     # eslint
```

## How it works

```
lib/
  site.ts          SITE_URL + brand constants (the one place to change the domain)
  conversions.ts   the single source of truth: typed Converter[] + helpers
app/
  layout.tsx       root layout, metadata defaults, header/footer chrome
  page.tsx         homepage — converters grouped by category
  [slug]/
    page.tsx       dynamic route: SSG, per-page SEO, FAQ JSON-LD, related links
    ConverterTool.tsx   the only "use client" component — live recompute on input
  sitemap.ts       generated from allSlugs()
  robots.ts        allow all, points at the sitemap
  not-found.tsx    branded 404
```

`lib/conversions.ts` is the heart of the project. Everything else — static
params, the sitemap, the homepage, SEO metadata and internal links — reads from
that one array, so the site grows by editing a single file.

## Adding a new converter

Append **one** `Converter` object to the `converters` array in
[`lib/conversions.ts`](lib/conversions.ts). Nothing else needs to change — the
new page, its metadata, the sitemap entry and the homepage card all appear
automatically.

```ts
const myConverter: Converter = {
  slug: "my-new-converter",            // becomes /my-new-converter
  category: "money",                    // "money" | "cooking" | "social"
  title: "Human-readable H1",
  metaTitle: "SEO <title>",
  metaDescription: "SEO meta description.",
  valueLine: "One line shown on the homepage card.",
  intro: "Lead paragraph under the H1.",
  inputs: [
    { type: "number", name: "amount", label: "Amount", default: 1 },
    // or { type: "select", name: "unit", label: "Unit", default: "a",
    //      options: [{ value: "a", label: "A" }] },
  ],
  convert: (values) => [
    // values is Record<string,string>; parse and return result lines.
    { label: "Result", value: "…", emphasis: true }, // the emphasised payoff
  ],
  faqs: [{ q: "Question?", a: "Answer." }],
  body: ["Paragraph one.", "Paragraph two."],
  updated: "2026-06-01",
};

// then add it to the exported array:
export const converters: Converter[] = [/* …existing…, */ myConverter];
```

Exactly one result line should set `emphasis: true` — that's the big number on
the dark "display". Use `hint` for the small print under a line.

## Changing the domain

The public base URL lives in exactly one place:
[`lib/site.ts`](lib/site.ts) → `SITE_URL`. It's currently
`https://www.convertuk.co.uk`. Change that single constant once the domain
is finalised and canonical tags, OpenGraph URLs, the sitemap and robots.txt all
update together.

## Updating tax-year figures

The UK income-tax and National Insurance constants for the salary converter are
grouped and commented near the top of the converter logic in
[`lib/conversions.ts`](lib/conversions.ts) (search for `TAX-YEAR CONSTANTS`).
Update those values each April; the `updated` date on the converter should be
bumped at the same time.

## Deploying

Push to a Git provider and import the repo into Vercel — no configuration
needed. Everything renders statically at build time, so it deploys to the edge
and serves instantly.

## SEO and content checks

Run `npm test` for calculator boundary and input-validation checks, then `npm run build` for static generation, lint and TypeScript checks. Review generated HTML for canonical URLs, unique titles, headings, reference tables and structured data.

`lib/guides.ts` produces visible reference tables from the same calculator functions. The About page documents sources and limitations. Update content dates only when the relevant content changes. Review salary assumptions every April; the current model covers 2026/27 England, Wales and Northern Ireland.

Analytics loads only when Vercel sets `VERCEL_ENV=production`. For another host, explicitly configure that environment variable or adapt the guard. `calculator_use` fires once per mounted calculator after a valid interaction on the public www hostname. It sends only the calculator slug, never the input values. Existing GA4 automatic page and form measurement settings should be reviewed separately in Analytics.

After deployment, inspect the homepage and changed tools in Search Console and request indexing of their canonical www URLs. The canonical sitemap is https://www.convertuk.co.uk/sitemap.xml. Redirected non-www URLs are expected to be excluded from the index; do not remove their redirects to make that report green.
