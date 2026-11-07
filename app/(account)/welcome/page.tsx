import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUrlForFlow, kratosBrowserUrl } from "@/lib/kratos/config";
import { first, type Search } from "@/lib/kratos/query";
import { identityLabel, readSession } from "@/lib/kratos/session";

export const metadata = { title: "Tổng quan" };

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const session = await readSession();
  if (session.kind === "aal2") {
    redirect(session.redirectTo);
  }
  if (session.kind === "none") {
    redirect(
      getUrlForFlow(kratosBrowserUrl(), "login", {
        return_to: first(query.return_to),
      }),
    );
  }

  const current = session.session;
  const label = identityLabel(current);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-mono">Xin chào</h1>
        <p className="text-sm text-secondary-foreground">
          Bạn đang đăng nhập{label ? ` với ${label}` : ""}.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-secondary-foreground">
            Đổi mật khẩu. Email và tên đăng nhập hiện chưa đổi được.
            <Button asChild variant="outline">
              <Link href="/settings">Mở cài đặt</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phiên đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-secondary-foreground">
            Xem phiên trình duyệt đang giữ.
            <Button asChild variant="outline">
              <Link href="/sessions">Xem phiên</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
