"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EdNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "CALENDAR", path: "/" },
    { name: "EXAMINATIONS", path: "/examinations" },
    { name: "SUBJECTS", path: "/subjects" },
    { name: "PREFERENCES", path: "/onboarding" },
  ];

  return (
    <nav className="border-b-2 border-ed-ink py-4 bg-ed-paper sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 flex justify-center space-x-12">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.name} 
              href={link.path}
              className={`font-ui text-[0.65rem] tracking-[0.2em] uppercase font-bold transition-all duration-300
                ${isActive 
                  ? "text-ed-ink border-b-2 border-ed-ink pb-1" 
                  : "text-ed-ink-light hover:text-ed-ink hover:border-b-2 hover:border-ed-rule pb-1"
                }
              `}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
