"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Calendar" },
  { href: "/tests", label: "Examinations" },
  { href: "/subjects", label: "Subjects" },
  { href: "/settings", label: "Preferences" },
];

export default function EdNav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center gap-8 py-3 px-8 border-b border-ed-rule">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              font-ui text-xs font-semibold uppercase tracking-[0.15em] 
              py-1 border-b-2 transition-all duration-300
              ${
                isActive
                  ? "text-ed-ink border-ed-rust"
                  : "text-ed-ink-light border-transparent hover:text-ed-ink"
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
