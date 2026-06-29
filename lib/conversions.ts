/**
 * lib/conversions.ts — the single source of truth for every converter.
 *
 * Each converter is ONE object in the `converters` array below. A dynamic
 * route (`app/[slug]/page.tsx`) renders any of them and the client tool
 * (`app/[slug]/ConverterTool.tsx`) runs its `convert()` live.
 *
 * To add converter #N: append one `Converter` object. Nothing else changes —
 * static params, sitemap, homepage and SEO all read from this file.
 */

/* ────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────── */

export type Category = "money" | "cooking" | "social";

/** A free-text/number input rendered as <input type="number">. */
export interface NumberInput {
  type: "number";
  name: string;
  label: string;
  /** Default value used to seed the form (kept as a number for clarity). */
  default: number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

/** A dropdown rendered as <select>. */
export interface SelectInput {
  type: "select";
  name: string;
  label: string;
  default: string;
  options: SelectOption[];
  help?: string;
}

export type InputField = NumberInput | SelectInput;

/** Form state is always string-keyed strings (what the DOM gives us). */
export type InputValues = Record<string, string>;

/** One line of output. The `emphasis` line is the visual payoff. */
export interface ResultLine {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Converter {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: Category;
  /** Short one-liner shown on the homepage card. */
  valueLine: string;
  /** Lead paragraph shown under the H1. */
  intro: string;
  inputs: InputField[];
  /** Pure function: form values in, result lines out. No side effects. */
  convert: (values: InputValues) => ResultLine[];
  faqs: Faq[];
  /** Long-form body copy, one string per paragraph. */
  body: string[];
  /** ISO date (YYYY-MM-DD) of the last content/figures review. */
  updated: string;
}

/* ────────────────────────────────────────────────────────────────────────
 * Small formatting / parsing helpers
 * ──────────────────────────────────────────────────────────────────────── */

/** Parse a form string into a finite number, falling back to 0. */
function toNumber(value: string | undefined, fallback = 0): number {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Format a value as GBP currency (en-GB), default whole pounds. */
function money(value: number, dp = 0): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value);
}

/** Format a plain decimal (en-GB grouping). */
function decimal(value: number, dp = 2): string {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value);
}

/* ────────────────────────────────────────────────────────────────────────
 * Converter 1 — Salary → real hourly rate after UK tax
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  UK 2025/26 TAX-YEAR CONSTANTS — review/update these once a year.     │
 *  │  Source: HMRC rates & thresholds for 2025/26 (England, Wales & NI).   │
 *  └─────────────────────────────────────────────────────────────────────┘
 * ──────────────────────────────────────────────────────────────────────── */

const TAX_YEAR = "2025/26";

// Income Tax
const PERSONAL_ALLOWANCE = 12_570; // tax-free allowance (£/yr)
const PA_TAPER_THRESHOLD = 100_000; // allowance cut £1 per £2 earned above this
const BASIC_RATE_BAND = 37_700; // width of the 20% band, measured above the allowance
const ADDITIONAL_RATE_THRESHOLD = 125_140; // 45% applies above this gross income
const BASIC_RATE = 0.2;
const HIGHER_RATE = 0.4;
const ADDITIONAL_RATE = 0.45;

// Employee (Class 1) National Insurance
const NI_PRIMARY_THRESHOLD = 12_570; // no employee NI below this (£/yr)
const NI_UPPER_EARNINGS_LIMIT = 50_270; // main rate applies up to here (£/yr)
const NI_MAIN_RATE = 0.08; // 8% between the primary threshold and UEL
const NI_UPPER_RATE = 0.02; // 2% on earnings above the UEL

/** Personal allowance after the £100k taper. */
function ukPersonalAllowance(gross: number): number {
  const taper = Math.max(0, (gross - PA_TAPER_THRESHOLD) / 2);
  return Math.max(0, PERSONAL_ALLOWANCE - taper);
}

/** UK income tax for England/Wales/NI on an annual gross salary. */
function ukIncomeTax(gross: number): number {
  const allowance = ukPersonalAllowance(gross);
  const taxable = Math.max(0, gross - allowance);
  // Once the allowance tapers, the 45% threshold (in taxable terms) shifts up.
  const additionalBandStart = ADDITIONAL_RATE_THRESHOLD - allowance;

  let tax = 0;
  // 20% basic-rate band
  tax += Math.min(taxable, BASIC_RATE_BAND) * BASIC_RATE;
  // 40% higher-rate band
  if (taxable > BASIC_RATE_BAND) {
    const higher = Math.min(taxable, additionalBandStart) - BASIC_RATE_BAND;
    tax += Math.max(0, higher) * HIGHER_RATE;
  }
  // 45% additional-rate band
  if (taxable > additionalBandStart) {
    tax += (taxable - additionalBandStart) * ADDITIONAL_RATE;
  }
  return tax;
}

/** Employee National Insurance (Class 1) on an annual gross salary. */
function ukEmployeeNI(gross: number): number {
  if (gross <= NI_PRIMARY_THRESHOLD) return 0;
  const mainBand = Math.min(gross, NI_UPPER_EARNINGS_LIMIT) - NI_PRIMARY_THRESHOLD;
  let ni = mainBand * NI_MAIN_RATE;
  if (gross > NI_UPPER_EARNINGS_LIMIT) {
    ni += (gross - NI_UPPER_EARNINGS_LIMIT) * NI_UPPER_RATE;
  }
  return ni;
}

const salaryToHourly: Converter = {
  slug: "salary-to-hourly-after-tax",
  category: "money",
  title: "Salary to real hourly rate (after UK tax)",
  metaTitle: "Salary to Hourly After Tax Calculator (UK 2025/26)",
  metaDescription:
    "Turn your UK annual salary into your real hourly rate after income tax and National Insurance. 2025/26 tax bands, personal allowance taper and employee NI built in.",
  valueLine: "What an hour of your time is really worth once HMRC has taken its cut.",
  intro:
    "Job ads quote a salary; what you actually feel is the hourly rate that lands in your account. This tool applies the UK 2025/26 income tax bands and employee National Insurance to show what each working hour is genuinely worth after tax.",
  inputs: [
    {
      type: "number",
      name: "salary",
      label: "Annual salary",
      prefix: "£",
      default: 35000,
      min: 0,
      step: 500,
      help: "Gross pay before tax, NI or pension.",
    },
    {
      type: "number",
      name: "hours",
      label: "Hours worked per week",
      suffix: "hrs",
      default: 37.5,
      min: 1,
      max: 80,
      step: 0.5,
    },
    {
      type: "number",
      name: "weeks",
      label: "Working weeks per year",
      suffix: "weeks",
      default: 52,
      min: 1,
      max: 52,
      step: 1,
      help: "Use 52 to include paid holiday, or fewer to price only the weeks you actually work.",
    },
  ],
  convert: (v) => {
    const salary = toNumber(v.salary);
    const hours = toNumber(v.hours);
    const weeks = toNumber(v.weeks);

    const tax = ukIncomeTax(salary);
    const ni = ukEmployeeNI(salary);
    const takeHome = salary - tax - ni;

    const annualHours = hours * weeks;
    const grossHourly = annualHours > 0 ? salary / annualHours : 0;
    const realHourly = annualHours > 0 ? takeHome / annualHours : 0;

    return [
      { label: "Take-home pay (per year)", value: money(takeHome) },
      {
        label: "Income tax",
        value: money(tax),
        hint: `${TAX_YEAR} England, Wales & NI bands`,
      },
      { label: "National Insurance", value: money(ni) },
      { label: "Gross hourly rate", value: money(grossHourly, 2) },
      {
        label: "Real hourly rate (after tax)",
        value: money(realHourly, 2),
        emphasis: true,
        hint:
          annualHours > 0
            ? `Based on ${decimal(annualHours, 0)} paid hours a year`
            : "Enter your hours and weeks to see this",
      },
    ];
  },
  faqs: [
    {
      q: "Which tax year does this use?",
      a: "The 2025/26 UK tax year: a £12,570 personal allowance, 20% basic, 40% higher and 45% additional rates, plus employee National Insurance of 8% between £12,570 and £50,270 and 2% above. These are clearly labelled constants in the code so they can be updated each April.",
    },
    {
      q: "Does it cover Scotland?",
      a: "No. The figures use the England, Wales and Northern Ireland income tax bands. Scotland has its own rates and bands (starter, basic, intermediate, higher, advanced and top), so a Scottish taxpayer's take-home will differ. National Insurance is the same UK-wide.",
    },
    {
      q: "Why is my 'real' hourly rate so much lower than the headline figure?",
      a: "Because the headline divides gross salary by hours, while the real rate divides your take-home pay by hours. Income tax and National Insurance typically remove 20–35% of a middle income, so the gap between the two numbers is exactly what HMRC takes.",
    },
    {
      q: "Does it include pension, student loan or salary sacrifice?",
      a: "Not yet — it deliberately keeps to tax and NI so the result is easy to verify. A workplace pension or student loan repayment would reduce your take-home further, so treat this as the best-case after-tax figure.",
    },
    {
      q: "What happens to my personal allowance over £100,000?",
      a: "It tapers: you lose £1 of allowance for every £2 you earn above £100,000, which is why earnings between £100,000 and £125,140 carry an effective ~60% marginal rate. The calculator handles this automatically — watch the real hourly rate barely move in that band.",
    },
  ],
  body: [
    "Two people on the same £45,000 salary can have very different hourly worth. Someone contracted for 35 hours across 46 working weeks is selling far fewer hours than a colleague grinding 45 hours over 50 weeks — yet both see the same number on the contract. Dividing take-home pay by the hours you actually give the job is the only way to compare roles, shifts or that tempting pay rise that comes with longer days.",
    "The calculation mirrors how HMRC stacks the charges. Your personal allowance comes off first, then the remaining income is taxed at 20%, 40% and 45% as it climbs through the bands. Employee National Insurance is layered on top at 8% up to the upper earnings limit and 2% beyond it. Take-home is simply gross minus those two, and the real hourly rate is take-home divided by the hours and weeks you enter.",
    "Use it to sanity-check overtime, a four-day week, or a job offer in a different city. If a £5,000 raise comes with five extra hours a week, the real hourly figure will often barely move — and sometimes it falls. Seeing the after-tax number per hour makes those trade-offs obvious in a way an annual salary never does.",
  ],
  updated: "2026-06-01",
};

/* ────────────────────────────────────────────────────────────────────────
 * Converter 2 — Cups → grams by ingredient
 * ──────────────────────────────────────────────────────────────────────── */

// Densities in grams per millilitre. Update if you re-benchmark an ingredient.
const INGREDIENTS: { value: string; label: string; density: number }[] = [
  { value: "flour", label: "Plain / all-purpose flour", density: 0.53 },
  { value: "caster-sugar", label: "Caster sugar", density: 0.85 },
  { value: "brown-sugar", label: "Brown sugar (packed)", density: 0.93 },
  { value: "butter", label: "Butter", density: 0.96 },
  { value: "milk", label: "Milk", density: 1.03 },
  { value: "honey", label: "Honey", density: 1.42 },
  { value: "oil", label: "Vegetable oil", density: 0.92 },
  { value: "rice", label: "Uncooked rice", density: 0.85 },
  { value: "cocoa", label: "Cocoa powder", density: 0.41 },
  { value: "water", label: "Water", density: 1.0 },
];

// Millilitres per unit of volume.
const VOLUME_UNIT_ML: Record<string, number> = {
  "us-cup": 236.588, // standard US cup
  ml: 1,
  "uk-tbsp": 15, // UK metric tablespoon
};

const GRAMS_PER_OUNCE = 28.3495;

const cupsToGrams: Converter = {
  slug: "cups-to-grams-by-ingredient",
  category: "cooking",
  title: "Cups to grams, by ingredient",
  metaTitle: "Cups to Grams Converter by Ingredient (UK)",
  metaDescription:
    "Convert US cups, millilitres or UK tablespoons to grams for flour, sugar, butter, honey and more. Per-ingredient densities mean a cup of flour and a cup of honey give different weights.",
  valueLine: "A cup of flour and a cup of honey weigh very different things — convert by ingredient.",
  intro:
    "A 'cup' is a measure of volume, but UK recipes and kitchen scales work in grams. Because ingredients have different densities, this converter uses a per-ingredient density to turn US cups, millilitres or UK tablespoons into an accurate gram weight.",
  inputs: [
    {
      type: "number",
      name: "amount",
      label: "Amount",
      default: 1,
      min: 0,
      step: 0.25,
    },
    {
      type: "select",
      name: "unit",
      label: "Measured in",
      default: "us-cup",
      options: [
        { value: "us-cup", label: "US cups (236.588 ml)" },
        { value: "ml", label: "Millilitres" },
        { value: "uk-tbsp", label: "UK tablespoons (15 ml)" },
      ],
    },
    {
      type: "select",
      name: "ingredient",
      label: "Ingredient",
      default: "flour",
      options: INGREDIENTS.map((i) => ({ value: i.value, label: i.label })),
    },
  ],
  convert: (v) => {
    const amount = toNumber(v.amount);
    const mlPerUnit = VOLUME_UNIT_ML[v.unit ?? "us-cup"] ?? 1;
    const ml = amount * mlPerUnit;

    const ingredient =
      INGREDIENTS.find((i) => i.value === v.ingredient) ?? INGREDIENTS[0];
    const grams = ml * ingredient.density;
    const ounces = grams / GRAMS_PER_OUNCE;

    return [
      {
        label: `Weight of ${ingredient.label.toLowerCase()}`,
        value: `${decimal(grams, grams < 100 ? 1 : 0)} g`,
        emphasis: true,
        hint: `Using a density of ${ingredient.density} g/ml`,
      },
      { label: "In ounces", value: `${decimal(ounces, 2)} oz` },
      { label: "Volume", value: `${decimal(ml, ml < 100 ? 1 : 0)} ml` },
    ];
  },
  faqs: [
    {
      q: "Why doesn't one cup always equal the same number of grams?",
      a: "Because a cup measures volume, not weight. A US cup of plain flour is about 125 g, but a US cup of honey is around 336 g — the honey is far denser. That's why a single 'cups to grams' number found online is so often wrong.",
    },
    {
      q: "Are these US cups or UK cups?",
      a: "US cups, at 236.588 ml each — the size assumed by almost all online recipes. A traditional UK 'breakfast cup' is roughly 284 ml, so if a vintage British recipe specifies cups, expect slightly larger quantities.",
    },
    {
      q: "How accurate are the densities?",
      a: "They're solid kitchen averages, accurate to within a few percent for everyday baking. Real flour varies with how tightly it's packed and how humid your kitchen is, so for bread and pastry a £10 set of digital scales will always beat any cup measure.",
    },
    {
      q: "Should I spoon or scoop my flour?",
      a: "Spoon it into the cup and level off with a knife. Dunking the cup straight into the bag compacts the flour and can add 20% more weight than the recipe intended — the single biggest cause of dense, dry bakes.",
    },
  ],
  body: [
    "American recipes measure by volume; British kitchens weigh by the gram. That mismatch is why a beautiful-looking US cookie recipe can fall flat in a UK oven — the conversion was done with a one-size-fits-all number that ignored what was actually in the cup. Flour, sugar, butter and honey all pack very differently, so the only reliable approach is to convert each ingredient using its own density.",
    "This tool does exactly that. It first turns your amount into millilitres (a US cup is 236.588 ml, a UK metric tablespoon is 15 ml), then multiplies by the ingredient's density in grams per millilitre. A cup of cocoa powder, which is light and airy, comes out near 97 g, while the same cup of honey lands well over 300 g. The gram figure is the one to trust when you reach for the scales.",
    "Keep in mind that baking rewards weighing over measuring. Cups are quick, but two cooks can scoop the same flour and be 20% apart. If a recipe matters — a birthday cake, a first loaf — convert to grams here, weigh it out, and you remove the biggest source of variation in the whole bake.",
  ],
  updated: "2026-06-01",
};

/* ────────────────────────────────────────────────────────────────────────
 * Converter 3 — Social media size checker
 * ──────────────────────────────────────────────────────────────────────── */

const SOCIAL_FORMATS: {
  value: string;
  label: string;
  size: string;
  ratio: string;
  tip: string;
}[] = [
  {
    value: "ig-reel",
    label: "Instagram Reel",
    size: "1080 × 1920 px",
    ratio: "9:16",
    tip: "Keep captions, your logo and any call-to-action within the central 1080 × 1420 area — Instagram lays the username, audio strip and action buttons over roughly the top and bottom 15%.",
  },
  {
    value: "ig-square",
    label: "Instagram square post",
    size: "1080 × 1080 px",
    ratio: "1:1",
    tip: "Safe all over, but remember the grid thumbnail is a centre-crop preview — put the hero of the image dead centre so it survives the grid.",
  },
  {
    value: "ig-portrait",
    label: "Instagram portrait post",
    size: "1080 × 1350 px",
    ratio: "4:5",
    tip: "The tallest shape the feed allows, so it claims the most screen space. Keep essential detail away from the very bottom where the caption and icons begin.",
  },
  {
    value: "story",
    label: "Instagram / Facebook Story",
    size: "1080 × 1920 px",
    ratio: "9:16",
    tip: "Leave about 250 px clear at the top (profile ring) and 250 px at the bottom (reply bar) so stickers, swipe-ups and text aren't clipped.",
  },
  {
    value: "tiktok",
    label: "TikTok video",
    size: "1080 × 1920 px",
    ratio: "9:16",
    tip: "The right-hand side and lower third are covered by the like/comment/share rail and the caption — keep subtitles centred and lifted clear of the bottom 20%.",
  },
  {
    value: "yt-short",
    label: "YouTube Short",
    size: "1080 × 1920 px",
    ratio: "9:16",
    tip: "The title and channel name sit across the bottom; keep key visuals in the upper two-thirds and avoid important text in the lowest 250 px.",
  },
  {
    value: "yt-thumb",
    label: "YouTube thumbnail",
    size: "1280 × 720 px",
    ratio: "16:9",
    tip: "The duration stamp covers the bottom-right corner. Use large, high-contrast text — most viewers first see this at roughly 210 × 118 px on mobile.",
  },
  {
    value: "x-landscape",
    label: "X (Twitter) landscape image",
    size: "1600 × 900 px",
    ratio: "16:9",
    tip: "X crops to about 16:9 in the timeline and reveals the full frame on tap. Keep faces and text inside the central 16:9 so nothing important is cropped in-feed.",
  },
  {
    value: "linkedin",
    label: "LinkedIn shared image",
    size: "1200 × 627 px",
    ratio: "1.91:1",
    tip: "This is the link-preview ratio LinkedIn favours. Keep logos and headlines clear of the edges, since the desktop and mobile crops differ slightly.",
  },
];

const socialSizeChecker: Converter = {
  slug: "social-media-size-checker",
  category: "social",
  title: "Social media image & video size checker",
  metaTitle: "Social Media Size Checker — Reels, Stories, Thumbnails",
  metaDescription:
    "Pick a platform and format to get the recommended pixel size, aspect ratio and a safe-zone tip so your text and logo never get cropped by the app's interface.",
  valueLine: "The exact pixel size and the safe zone where the app's buttons won't cover your text.",
  intro:
    "Every platform crops differently and lays its own buttons over your content. Choose a format below to get the recommended export size, the aspect ratio, and where the 'safe zone' is so your message survives the interface.",
  inputs: [
    {
      type: "select",
      name: "format",
      label: "Platform & format",
      default: "ig-reel",
      options: SOCIAL_FORMATS.map((f) => ({ value: f.value, label: f.label })),
    },
  ],
  convert: (v) => {
    const format =
      SOCIAL_FORMATS.find((f) => f.value === v.format) ?? SOCIAL_FORMATS[0];
    return [
      { label: "Recommended size", value: format.size, emphasis: true },
      { label: "Aspect ratio", value: format.ratio, hint: format.tip },
    ];
  },
  faqs: [
    {
      q: "What is a 'safe zone'?",
      a: "It's the part of your frame that the app's own interface never covers. Buttons, captions, profile rings and progress bars all sit on top of your content, so anything important — text, faces, logos, a call-to-action — needs to stay inside the safe zone to avoid being hidden.",
    },
    {
      q: "Why 1080 × 1920 for almost every vertical video?",
      a: "It's the 9:16 full-screen ratio of a phone and the resolution every major app re-encodes to. Exporting at 1080 × 1920 means the platform does the least re-compression, which keeps your video looking crisp instead of blocky.",
    },
    {
      q: "Can I just upload a bigger image and let the app resize it?",
      a: "You can, but you lose control of the crop and quality. Matching the recommended size means you decide what's in frame and the platform compresses less. Oversized uploads are also slower and more likely to be aggressively re-encoded.",
    },
    {
      q: "Do these sizes change?",
      a: "Occasionally — platforms tweak their layouts. The pixel sizes here are stable, widely-used standards; the safe-zone margins are deliberately a little generous so your content stays clear even after a minor app update.",
    },
  ],
  body: [
    "The fastest way to look amateur on social media is to have your caption clipped by the platform's own buttons. Each app reserves slices of the screen for its interface — TikTok's action rail down the right, Instagram's reply bar across the bottom of a Story, YouTube's duration stamp in the thumbnail corner — and those slices change depending on the format. Designing to the raw canvas size isn't enough; you have to design to the part that stays visible.",
    "This checker gives you both numbers that matter: the export size to hand your design tool, and a plain-English note on where the safe zone sits for that specific format. Build to the recommended pixels, then keep your text, logo and key subject inside the safe area, and your post will read correctly whether it's seen on a tiny phone or a desktop preview.",
    "If you only remember one rule, make it this: centre the things that must be seen, and leave breathing room top and bottom on anything vertical. The middle of the frame is almost never covered, so a headline parked dead-centre survives every crop the algorithms throw at it.",
  ],
  updated: "2026-06-01",
};

/* ────────────────────────────────────────────────────────────────────────
 * Converter 4 — Millilitres → UK tablespoons
 * ──────────────────────────────────────────────────────────────────────── */

const UK_TABLESPOON_ML = 15; // UK metric tablespoon
const UK_TEASPOON_ML = 5; // UK metric teaspoon
const UK_FLUID_OUNCE_ML = 28.4130625; // imperial (UK) fluid ounce

const mlToUkTablespoons: Converter = {
  slug: "ml-to-uk-tablespoons",
  category: "cooking",
  title: "Millilitres to UK tablespoons",
  metaTitle: "ml to UK Tablespoons Converter (15 ml spoons)",
  metaDescription:
    "Convert millilitres to UK tablespoons, teaspoons and fluid ounces. Uses the British metric standard of a 15 ml tablespoon and 5 ml teaspoon — not the 14.8 ml US spoon.",
  valueLine: "Millilitres into the 15 ml British spoon — not the 14.8 ml American one.",
  intro:
    "Lost your measuring jug? This converts any millilitre amount into UK tablespoons and teaspoons using the British metric standard — a 15 ml tablespoon and a 5 ml teaspoon — so a recipe written in ml can be measured with the spoons in your drawer.",
  inputs: [
    {
      type: "number",
      name: "ml",
      label: "Millilitres",
      suffix: "ml",
      default: 100,
      min: 0,
      step: 5,
    },
  ],
  convert: (v) => {
    const ml = toNumber(v.ml);
    const tablespoons = ml / UK_TABLESPOON_ML;
    const teaspoons = ml / UK_TEASPOON_ML;
    const fluidOunces = ml / UK_FLUID_OUNCE_ML;

    return [
      {
        label: "UK tablespoons",
        value: `${decimal(tablespoons, 2)} tbsp`,
        emphasis: true,
        hint: "British metric tablespoon = 15 ml",
      },
      { label: "UK teaspoons", value: `${decimal(teaspoons, 2)} tsp` },
      { label: "UK fluid ounces", value: `${decimal(fluidOunces, 2)} fl oz` },
    ];
  },
  faqs: [
    {
      q: "Is a UK tablespoon really 15 ml?",
      a: "Yes. Since metrication, the British standard tablespoon is defined as exactly 15 ml and the teaspoon as 5 ml. That's what UK measuring-spoon sets are made to, so this converter matches the spoons in most British kitchens.",
    },
    {
      q: "How is that different from an American tablespoon?",
      a: "A US tablespoon is about 14.8 ml and a US teaspoon roughly 4.93 ml — close, but not identical. Over several spoonfuls the difference adds up, and for the old Australian 20 ml tablespoon it's larger still, so it pays to know which standard a recipe assumes.",
    },
    {
      q: "Why are the fluid ounces 'UK'?",
      a: "Because an imperial (UK) fluid ounce is 28.413 ml, whereas a US fluid ounce is 29.574 ml. British recipes and glassware use the imperial figure, which is the one applied here.",
    },
    {
      q: "Can I trust spoons for baking?",
      a: "For liquids and small amounts of flavouring, yes. For flour, sugar and other dry bulk ingredients, weigh in grams instead — a level spoonful of flour can vary a lot depending on how it's filled.",
    },
  ],
  body: [
    "Spoon measures feel old-fashioned until the moment your measuring jug is in the dishwasher and a recipe asks for 45 ml of something. Knowing that a UK tablespoon holds 15 ml turns that into a clean three spoonfuls, no jug required. This converter does the division for you and adds teaspoons and fluid ounces so you can use whatever's nearest to hand.",
    "The important detail is the standard. Britain settled on a neat metric spoon — 15 ml for a tablespoon, 5 ml for a teaspoon — so the numbers stay tidy: 30 ml is two tablespoons, 5 ml is a single teaspoon. American spoons run a fraction smaller and the old Australian tablespoon was a full 20 ml, which is exactly the kind of mismatch that throws a recipe off when it's scaled up.",
    "For liquids — milk, oil, vanilla, syrup — spoons are perfectly reliable, and this tool gets you there quickly. For dry baking staples like flour and sugar, reach for the scales instead: weight beats volume every time once you're past a spoonful or two.",
  ],
  updated: "2026-06-01",
};

/* ────────────────────────────────────────────────────────────────────────
 * Converter 5 — Day rate → salary
 * ──────────────────────────────────────────────────────────────────────── */

const dayRateToSalary: Converter = {
  slug: "day-rate-to-salary",
  category: "money",
  title: "Day rate to annual salary",
  metaTitle: "Day Rate to Salary Calculator (UK Contractors)",
  metaDescription:
    "Convert a contractor or freelancer day rate into gross annual billings, monthly and weekly income and an equivalent salary — based on realistic billable days, not all 260 weekdays.",
  valueLine: "Turn a day rate into real annual billings — using billable days, not the 260 on the calendar.",
  intro:
    "A day rate looks great until you multiply it out — and most people multiply it wrong. There aren't 260 paid days in a freelancer's year once holiday, admin and gaps between contracts are removed. Enter your rate and realistic billable days to see what it actually adds up to.",
  inputs: [
    {
      type: "number",
      name: "dayRate",
      label: "Day rate",
      prefix: "£",
      default: 400,
      min: 0,
      step: 25,
    },
    {
      type: "number",
      name: "billableDays",
      label: "Billable days per year",
      suffix: "days",
      default: 220,
      min: 1,
      max: 365,
      step: 5,
      help: "220 is a common realistic figure once holiday, admin and downtime are removed.",
    },
  ],
  convert: (v) => {
    const dayRate = toNumber(v.dayRate);
    const billableDays = toNumber(v.billableDays);

    const annual = dayRate * billableDays;
    const monthly = annual / 12;
    const weekly = annual / 52;

    return [
      {
        label: "Gross annual billings",
        value: money(annual),
        emphasis: true,
        hint: `${decimal(billableDays, 0)} billable days at ${money(dayRate)}/day`,
      },
      { label: "Per month (gross)", value: money(monthly) },
      { label: "Per week (gross)", value: money(weekly) },
      {
        label: "Equivalent gross salary",
        value: money(annual),
        hint: "Before employer pension, holiday & benefits — see the FAQ",
      },
    ];
  },
  faqs: [
    {
      q: "Why not just multiply my day rate by 260 weekdays?",
      a: "Because nobody bills all 260. Take off statutory holiday and a couple of weeks of personal leave (around 28 days), bank holidays (8), the odd sick day, plus time spent on admin, invoicing, sales and the gaps between contracts, and a realistic year is closer to 200–230 billable days. Using 260 overstates your income by a fifth or more.",
    },
    {
      q: "Where does the default of 220 come from?",
      a: "It's a widely-used planning figure: roughly 232 working days after holiday and bank holidays, minus a small allowance for sickness and non-billable admin. Adjust it to match your own pipeline — a fully-booked contractor might hit 230+, while someone building a client base may bill 180 or fewer.",
    },
    {
      q: "Is the day rate the same as a salary?",
      a: "No — they're not like-for-like. As a contractor you fund your own pension, holiday, sick pay and equipment, and you carry the risk of empty weeks. A like-for-like permanent salary is usually meaningfully lower than your gross billings once those employer-provided benefits are valued in.",
    },
    {
      q: "Does this account for tax, IR35 or expenses?",
      a: "No. It shows gross billings — money invoiced before tax, National Insurance, corporation tax, accountancy fees or expenses. Your take-home depends on your IR35 status and how you operate (umbrella, sole trader or limited company), so treat this as the top-line figure.",
    },
    {
      q: "How do I turn billings into a comparable salary?",
      a: "As a rough rule, knock 20–30% off your gross billings to reflect the pension, paid holiday and job security a permanent role includes — then compare that to advertised salaries. If you want to match a £60,000 salaried package, you generally need to bill noticeably more than £60,000.",
    },
  ],
  body: [
    "The leap from a day rate to 'so what do I earn?' trips up almost every new contractor. Four hundred pounds a day sounds like £104,000 a year if you multiply by 260 weekdays — but that figure assumes you never take a holiday, never get sick, never spend a day chasing the next contract and never have a quiet month. Strip those out and the honest number is the one that matters when you're planning a mortgage or deciding whether to go freelance at all.",
    "This calculator multiplies your rate by realistic billable days rather than the full calendar. The default of 220 already removes statutory and personal holiday, bank holidays and a margin for admin and downtime; nudge it up if you're consistently booked or down if your pipeline is lumpy. The headline is your gross annual billings, with the monthly and weekly equivalents underneath for budgeting.",
    "Finally, resist comparing gross billings directly to a permanent salary. A salaried role bundles in employer pension contributions, paid holiday, sick pay and stability that your billings have to cover themselves. A useful habit is to discount your billings by 20–30% before holding them up against an advertised salary — that's the closest you'll get to a fair, like-for-like comparison.",
  ],
  updated: "2026-06-01",
};

/* ────────────────────────────────────────────────────────────────────────
 * Registry + helpers
 * ──────────────────────────────────────────────────────────────────────── */

/** Every converter on the site. Append a new object to add one. */
export const converters: Converter[] = [
  salaryToHourly,
  cupsToGrams,
  socialSizeChecker,
  mlToUkTablespoons,
  dayRateToSalary,
];

/** Category metadata for grouping on the homepage. */
export const categories: { id: Category; label: string; blurb: string }[] = [
  {
    id: "money",
    label: "Money & work",
    blurb: "Pay, day rates and the real value of your time.",
  },
  {
    id: "cooking",
    label: "Kitchen & cooking",
    blurb: "Cups, spoons and grams that actually match your scales.",
  },
  {
    id: "social",
    label: "Social & content",
    blurb: "Get the size and safe zone right before you post.",
  },
];

const bySlug = new Map<string, Converter>(
  converters.map((converter) => [converter.slug, converter]),
);

/** Look up a single converter by its slug (undefined if not found). */
export function getConverter(slug: string): Converter | undefined {
  return bySlug.get(slug);
}

/** All converter slugs — used for static params, the sitemap and links. */
export function allSlugs(): string[] {
  return converters.map((converter) => converter.slug);
}

/** Converters in the same category, excluding the given slug. */
export function relatedConverters(slug: string): Converter[] {
  const current = getConverter(slug);
  if (!current) return [];
  return converters.filter(
    (c) => c.category === current.category && c.slug !== slug,
  );
}
