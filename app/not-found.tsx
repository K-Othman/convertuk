import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-5 py-20">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        That converter doesn&apos;t exist.
      </h1>
      <p className="mt-3 max-w-prose text-pretty text-slate-600">
        The page you were after isn&apos;t here. It may have moved, or the link
        was mistyped.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
      >
        <span aria-hidden className="font-mono text-accent-bright">
          ⇄
        </span>
        Browse all converters
      </Link>
    </div>
  );
}
