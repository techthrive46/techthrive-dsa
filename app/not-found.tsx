import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="heading-slab text-3xl">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That algorithm or page doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="ink-lift mt-6 inline-flex rounded-md border border-foreground/80 bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
      >
        Back home
      </Link>
    </main>
  );
}
