import Link from "next/link";

export function AuthLinks({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  if (links.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      {links.map((link) =>
        link.href.startsWith("/") ? (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="font-medium text-primary hover:underline"
          >
            {link.label}
          </Link>
        ) : (
          <a
            key={link.href + link.label}
            href={link.href}
            className="font-medium text-primary hover:underline"
          >
            {link.label}
          </a>
        ),
      )}
    </div>
  );
}
