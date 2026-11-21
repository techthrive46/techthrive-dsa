import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";

export function SiteNav() {
  return (
    <header className="border-b border-dashed border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="heading-slab shrink-0 text-xl">
          AlgoThrive
        </Link>
        <NavLinks />
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
