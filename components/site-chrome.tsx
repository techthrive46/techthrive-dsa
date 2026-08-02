import Link from "next/link";

export function SiteNav() {
  return (
    <header className="border-b border-dashed border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="heading-slab text-xl">
          AlgoThrive
        </Link>
        <nav className="flex items-center gap-6 text-sm font-bold">
          <Link href="/sorting" className="transition-colors hover:text-primary">
            Sorting
          </Link>
          <Link href="/searching" className="transition-colors hover:text-primary">
            Searching
          </Link>
          <Link href="/#topics" className="transition-colors hover:text-primary">
            Topics
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-dashed border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-5 py-8 text-center">
        <p className="script-note text-lg text-primary">
          built for students who think in pictures
        </p>
        <p className="text-sm text-muted-foreground">AlgoThrive © 2026</p>
      </div>
    </footer>
  );
}
