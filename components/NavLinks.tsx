"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/sorting", label: "Sorting" },
  { href: "/searching", label: "Searching" },
  { href: "/trees", label: "Trees" },
  { href: "/recursion", label: "Recursion" },
  { href: "/stacks-queues", label: "Stacks & Queues" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Topics"
      className="-mr-5 flex min-w-0 items-center gap-5 overflow-x-auto pr-5 text-sm font-bold whitespace-nowrap"
    >
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`transition-colors hover:text-primary ${
              active ? "text-primary underline decoration-2 underline-offset-[6px]" : ""
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
