import Link from "next/link";
import { ReactNode } from "react";

import { toAbsoluteUrl } from "@/lib/helpers";
import { identityLabel, logoutUrl, readSession } from "@/lib/kratos/session";

import { AccountNav } from "./nav";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await readSession();
  const signedIn = session.kind === "session" ? session.session : undefined;
  const leave = signedIn ? await logoutUrl() : "";
  const label = identityLabel(signedIn);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/40 md:flex-row">
      <aside className="flex flex-col gap-6 border-b border-border bg-background p-4 md:w-64 md:border-r md:border-b-0 md:p-6">
        <Link href="/welcome" className="flex items-center gap-3">
          <img
            src={toAbsoluteUrl("/media/app/mini-logo.svg")}
            alt="Viết Sớ"
            className="h-7"
          />
          <span className="text-sm font-semibold text-mono">Viết Sớ</span>
        </Link>
        {label ? (
          <p className="truncate text-sm text-secondary-foreground">{label}</p>
        ) : null}
        <AccountNav logoutUrl={leave} />
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
