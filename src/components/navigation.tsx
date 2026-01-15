"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";

import { cn } from "@/lib/utils";
import { useSecretAdmin } from "@/providers/secret-admin-provider";

const header = tv({
  base: "sticky top-0 z-50 transition-all duration-300",
  defaultVariants: {
    scrolled: false,
  },
  variants: {
    scrolled: {
      false: "bg-black border-b border-transparent",
      true: "bg-[#1c1c1c] border-b border-zinc-800",
    },
  },
});

export function Navigation() {
  const pathname = usePathname();
  const { handleElementClick } = useSecretAdmin();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/introduce", label: "Introduce" },
    { href: "/archive", label: "Archive" },
  ];

  return (
    <header className={header({ scrolled })} onClick={handleElementClick}>
      <div className="mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          onClick={(e) => e.stopPropagation()}
          className="text-foreground hover:opacity-80 transition-opacity"
        >
          <Camera className="size-6" />
        </Link>
        <nav className="flex gap-6 text-sm font-sans font-medium text-zinc-400">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "hover:text-foreground transition-colors",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
