"use client";

import { useState } from "react";
import {
  getConverter,
  type InputField,
  type InputValues,
  type ResultLine,
} from "@/lib/conversions";

/**
 * The site's only client component. It re-looks-up the converter by slug
 * (functions can't cross the server→client boundary as props), holds the
 * input state, and recomputes results on every keystroke — no submit button.
 */
export default function ConverterTool({ slug }: { slug: string }) {
  const converter = getConverter(slug);

  // Seed form state from each input's default. Hooks must run unconditionally,
  // so this is computed even if the converter is missing (it won't be).
  const [values, setValues] = useState<InputValues>(() =>
    Object.fromEntries(
      (converter?.inputs ?? []).map((field) => [
        field.name,
        String(field.default),
      ]),
    ),
  );

  if (!converter) return null;

  const update = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const results = converter.convert(values);

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-start">
      {/* Inputs */}
      <form
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label={`${converter.title} inputs`}
      >
        <div className="space-y-5">
          {converter.inputs.map((field) => (
            <Field
              key={field.name}
              field={field}
              value={values[field.name] ?? ""}
              onChange={(v) => update(field.name, v)}
            />
          ))}
        </div>
      </form>

      {/* Results — the dark "display", the page's signature element. */}
      <ResultsDisplay results={results} />
    </div>
  );
}

/** A single labelled input (number or select). */
function Field({
  field,
  value,
  onChange,
}: {
  field: InputField;
  value: string;
  onChange: (value: string) => void;
}) {
  const helpId = field.help ? `${field.name}-help` : undefined;

  return (
    <div>
      <label
        htmlFor={field.name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {field.label}
      </label>

      {field.type === "select" ? (
        <select
          id={field.name}
          value={value}
          aria-describedby={helpId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 transition-colors hover:border-slate-400 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40 hover:border-slate-400">
          {field.prefix ? (
            <span className="grid place-items-center bg-slate-50 px-3 font-mono text-sm text-slate-500">
              {field.prefix}
            </span>
          ) : null}
          <input
            id={field.name}
            type="number"
            inputMode="decimal"
            value={value}
            min={field.min}
            max={field.max}
            step={field.step}
            aria-describedby={helpId}
            onChange={(e) => onChange(e.target.value)}
            className="tabular w-full bg-white px-3 py-2.5 text-slate-900 focus:outline-none"
          />
          {field.suffix ? (
            <span className="grid place-items-center bg-slate-50 px-3 text-sm text-slate-500">
              {field.suffix}
            </span>
          ) : null}
        </div>
      )}

      {field.help ? (
        <p id={helpId} className="mt-1.5 text-xs text-slate-500">
          {field.help}
        </p>
      ) : null}
    </div>
  );
}

/** The dark results panel. The emphasised line is the payoff. */
function ResultsDisplay({ results }: { results: ResultLine[] }) {
  const emphasised = results.find((r) => r.emphasis);
  const rest = results.filter((r) => !r.emphasis);

  return (
    <div className="overflow-hidden rounded-2xl bg-ink shadow-display ring-1 ring-ink-line">
      <div className="flex items-center justify-between border-b border-ink-line px-5 py-3 sm:px-6">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Result
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
          Live
        </span>
      </div>

      <div
        // aria-live announces the recalculated payoff to screen readers.
        role="status"
        aria-live="polite"
        className="px-5 py-6 sm:px-6"
      >
        {emphasised ? (
          <div className="mb-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-bright/80">
              {emphasised.label}
            </p>
            <p className="tabular mt-1 break-words font-mono text-4xl font-bold leading-none text-accent-bright sm:text-5xl">
              {emphasised.value}
            </p>
            {emphasised.hint ? (
              <p className="mt-2 text-sm text-slate-400">{emphasised.hint}</p>
            ) : null}
          </div>
        ) : null}

        <dl className="divide-y divide-ink-line/70">
          {rest.map((line) => (
            <div key={line.label} className="py-3 first:pt-0">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-400">{line.label}</dt>
                <dd className="tabular shrink-0 text-right font-mono text-base text-slate-100">
                  {line.value}
                </dd>
              </div>
              {line.hint ? (
                <p className="mt-1 text-xs text-slate-500 text-pretty">
                  {line.hint}
                </p>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
