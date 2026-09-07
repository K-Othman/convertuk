import { getConverter, type InputValues } from "./conversions";

interface Guide {
  heading: string;
  summary: string;
  columns: string[];
  rows: string[][];
  note: string;
}
function result(slug: string, values: InputValues, label: string) {
  return getConverter(slug)!.convert(values).find(line => line.label === label)!.value;
}
const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export function getGuide(slug: string): Guide | undefined {
  if (slug === "ml-to-uk-tablespoons") return {
    heading: "ml to UK tablespoons conversion table",
    summary: "15 ml = 1 UK tablespoon = 3 teaspoons. Divide millilitres by 15 for tablespoons, or by 5 for teaspoons. For example, 45 ml ÷ 15 = 3 tablespoons.",
    columns: ["Millilitres", "UK tablespoons", "UK teaspoons"],
    rows: [5, 10, 15, 20, 30, 45, 50, 60, 100, 150, 250].map(ml => [
      `${ml} ml`, result(slug, { ml: String(ml) }, "UK tablespoons"), result(slug, { ml: String(ml) }, "UK teaspoons")]),
    note: "Decimal spoon counts are rounded to two places. Use level, marked metric measuring spoons; a dining spoon is not a calibrated measure.",
  };
  if (slug === "day-rate-to-salary") return {
    heading: "Day rate to annual income: common examples",
    summary: "Annual gross income = day rate × billable days. At £400 a day for 220 days, that is £88,000 a year, or about £7,333 a month averaged over 12 months.",
    columns: ["Day rate", "200 days/year", "220 days/year"],
    rows: [150, 200, 250, 300, 350, 400, 450, 500, 600, 750].map(rate => [gbp(rate), gbp(rate * 200), gbp(rate * 220)]),
    note: "These are gross invoices before costs and tax, excluding VAT. Monthly averages do not predict when invoices will be paid. To work backwards, divide your target annual billings by your expected billable days: £60,000 ÷ 220 ≈ £272.73 per day.",
  };
  if (slug === "cups-to-grams-by-ingredient") return {
    heading: "One cup in grams: ingredient comparison",
    summary: "Grams = cups × millilitres per cup × density in g/ml. A US cup of plain flour is approximately 125 g using this tool's 0.53 g/ml assumption; a 250 ml metric cup is approximately 133 g.",
    columns: ["Ingredient", "1 US cup", "1 metric cup"],
    rows: getConverter(slug)!.inputs.flatMap(field => field.type === "select" && field.name === "ingredient" ? field.options.map(option => [
      option.label,
      getConverter(slug)!.convert({ amount: "1", unit: "us-cup", ingredient: option.value })[0].value,
      getConverter(slug)!.convert({ amount: "1", unit: "metric-cup", ingredient: option.value })[0].value,
    ]) : []),
    note: "Estimates use this calculator's density assumptions and round to the displayed precision. Packing and moisture affect the actual weight; use the recipe's gram quantities when provided.",
  };
  if (slug === "salary-to-hourly-after-tax") return {
    heading: "Salary to hourly pay examples for 2026/27",
    summary: "After-tax hourly pay = (annual salary − Income Tax − employee National Insurance) ÷ (weekly hours × weeks). At £35,000, 37.5 hours and 52 weeks, the annual estimate is £28,720 after tax and NI, or £14.73 per paid hour.",
    columns: ["Gross salary", "Annual take-home estimate", "After-tax hourly"],
    rows: [25000, 30000, 35000, 40000, 50000, 60000].map(salary => [gbp(salary),
      result(slug, { salary: String(salary), hours: "37.5", weeks: "52" }, "Take-home pay (per year)"),
      result(slug, { salary: String(salary), hours: "37.5", weeks: "52" }, "Real hourly rate (after tax)")]),
    note: "Assumes 37.5 hours × 52 weeks, England/Wales/Northern Ireland, standard allowance and employee NI. Excludes pension and student-loan deductions. Annual NI estimates may differ from payroll calculations per pay period.",
  };
  if (slug === "social-media-size-checker") return {
    heading: "Social media export-size reference",
    summary: "These presets are starting points for your design. Select a format in the tool for its layout tip, then check the crop and overlays in the destination app.",
    columns: ["Format", "Export size", "Aspect ratio"],
    rows: getConverter(slug)!.inputs.flatMap(field => field.type === "select" ? field.options.map(option => [option.label,
      result(slug, { format: option.value }, "Recommended size"), result(slug, { format: option.value }, "Aspect ratio")]) : []),
    note: "Suggested margins are approximate and vary by device and interface. YouTube thumbnail guidance was checked on 7 September 2026; other rows are common export presets, not exhaustive current platform specifications.",
  };
}
