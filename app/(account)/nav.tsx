"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/welcome", label: "Tổng quan" },
  { href: "/sessions", label: "Phiên đăng nhập" },
  { href: "/settings", label: "Cài đặt" },
];

export function AccountNav({ logoutUrl }: { logoutUrl: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto md:flex-col">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap",
              active
                ? "bg-primary text-primary-foreground"
                : "text-secondary-foreground hover:bg-accent",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      {logoutUrl ? (
        <a
          href={logoutUrl}
          className="rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent whitespace-nowrap"
        >
          Đăng xuất
        </a>
      ) : null}
    </nav>
  );
}
