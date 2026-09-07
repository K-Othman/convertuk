import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About ConvertUK & Calculation Methods",
  description: "How ConvertUK calculates salary after tax, contractor income and kitchen measurements, including sources, assumptions and limitations.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: { title: "About ConvertUK & Calculation Methods", url: absoluteUrl("/about") },
};

export default function AboutPage() {
  return <article className="mx-auto max-w-3xl space-y-7 px-5 py-12 text-slate-700">
    <h1 className="text-3xl font-bold text-ink">About ConvertUK & calculation methods</h1>
    <p>ConvertUK is a free collection of calculators for everyday work, cooking and content creation. Each tool explains its inputs and assumptions so you can check whether the result fits your situation.</p>
    <section className="space-y-3"><h2 className="text-xl font-semibold text-ink">Salary and contractor income</h2>
      <p>The <Link className="underline" href="/salary-to-hourly-after-tax">salary calculator</Link> estimates 2026/27 Income Tax for England, Wales and Northern Ireland and standard employee National Insurance. It uses annual thresholds, the standard personal allowance and its taper above £100,000. National Insurance on actual payslips is normally calculated per pay period, so irregular pay and rounding can produce differences.</p>
      <p>It excludes Scottish Income Tax, pensions, student loans, salary sacrifice, benefits in kind, other income and non-standard tax codes or NI categories. It is an estimate, not a payroll calculation or personal tax advice.</p>
      <ul className="list-disc space-y-2 pl-5"><li><a className="underline" href="https://www.gov.uk/income-tax-rates">GOV.UK: Income Tax rates and allowances</a></li><li><a className="underline" href="https://www.gov.uk/national-insurance/how-much-you-pay">GOV.UK: employee National Insurance</a></li></ul>
      <p>The <Link className="underline" href="/day-rate-to-salary">day-rate calculator</Link> multiplies your rate by your expected billable days. Its 220-day default is an example, not an employment entitlement. Gross invoices are not take-home pay or a like-for-like salaried package.</p>
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold text-ink">Cooking measurements</h2>
      <p>The <Link className="underline" href="/ml-to-uk-tablespoons">spoon converter</Link> uses 15 ml per UK metric tablespoon, 5 ml per teaspoon and 28.4130625 ml per imperial fluid ounce. Use marked measuring spoons: ordinary cutlery has no reliable capacity.</p>
      <p>The <Link className="underline" href="/cups-to-grams-by-ingredient">cups-to-grams calculator</Link> multiplies volume by an ingredient density. US cups are 236.588 ml and metric cups are 250 ml. The displayed densities are approximate assumptions; packing, brands and moisture change the weight. Prefer the recipe author&apos;s weights and a kitchen scale when precision matters.</p>
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold text-ink">Social media presets</h2>
      <p>The <Link className="underline" href="/social-media-size-checker">social size guide</Link> provides export presets and suggested layout margins, not a guarantee against cropping. Platform interfaces and upload requirements can change. Check the platform preview before publishing.</p>
      <p><a className="underline" href="https://support.google.com/youtube/answer/72431?hl=en">YouTube&apos;s current thumbnail guidance</a> recommends 3840 × 2160 pixels for standard video thumbnails; this preset was checked on 7 September 2026.</p>
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold text-ink">Checking a result</h2><p>Change one input at a time and compare the result with the formula and example table on the tool page. The last-updated date records a content change; it does not mean an independent professional has certified the result.</p></section>
    <Link className="inline-block font-medium text-accent underline" href="/">Browse all calculators</Link>
  </article>;
}
