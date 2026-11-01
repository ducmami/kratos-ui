import Link from "next/link";
import type { Session } from "@ory/client";
import { buttonVariants } from "@/components/ui/button";
import { cookieHeader, kratosFrontend } from "@/lib/kratos";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tài khoản" };

function sessionEmail(session: Session): string {
  const traits = session.identity?.traits;
  if (
    traits &&
    typeof traits === "object" &&
    "email" in traits &&
    typeof traits.email === "string"
  ) {
    return traits.email;
  }
  return "";
}

export default async function HomePage() {
  const cookie = await cookieHeader();
  let session: Session | null = null;
  try {
    session = (await kratosFrontend().toSession({ cookie })).data;
  } catch {
    session = null;
  }

  if (!session) {
    return (
      <div className="space-y-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Vietso</h1>
        <p className="text-sm text-muted-foreground">
          Đăng nhập hoặc tạo tài khoản để tiếp tục.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Đăng nhập
          </Link>
          <Link
            href="/registration"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "w-full",
            )}
          >
            Đăng ký
          </Link>
        </div>
      </div>
    );
  }

  const email = sessionEmail(session);

  return (
    <div className="space-y-5 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Đã đăng nhập</h1>
      {email ? <p className="text-sm text-foreground">{email}</p> : null}
      <div className="flex flex-col gap-3">
        <Link
          href="/settings"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Cài đặt
        </Link>
        <form action="/logout" method="post">
          <button
            type="submit"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "w-full",
            )}
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </div>
  );
}
