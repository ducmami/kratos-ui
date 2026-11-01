import { redirect } from "next/navigation";

import { AuthLinks } from "@/components/kratos/auth-links";
import { FlowForm } from "@/components/kratos/flow-form";
import { frontendApi, requestCookie, requestLanguage } from "@/lib/kratos/client";
import { appPath, getUrlForFlow, kratosBrowserUrl } from "@/lib/kratos/config";
import { loadOrRedirect } from "@/lib/kratos/errors";
import { first, isQuerySet, type Search } from "@/lib/kratos/query";
import { readSession } from "@/lib/kratos/session";

export const metadata = { title: "Khôi phục tài khoản" };

export default async function RecoveryPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await readSession();
  if (session.kind === "session") {
    redirect("/welcome");
  }

  const query = await searchParams;
  const flowId = isQuerySet(query.flow) ? query.flow : "";
  const returnTo = first(query.return_to);
  const init = getUrlForFlow(kratosBrowserUrl(), "recovery", {
    return_to: returnTo,
  });

  if (!flowId) {
    redirect(init);
  }

  const flow = await loadOrRedirect(async () => {
    return frontendApi(await requestLanguage())
      .getRecoveryFlow({ id: flowId, cookie: await requestCookie() })
      .then((res) => res.data);
  }, init);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">Khôi phục tài khoản</h1>
        <p className="text-sm text-secondary-foreground">
          Nhập email để nhận hướng dẫn đặt lại mật khẩu.
        </p>
      </div>
      <FlowForm ui={flow.ui} />
      <AuthLinks
        links={[
          {
            href: appPath("/login", {
              return_to: returnTo || flow.return_to || "",
            }),
            label: "Quay lại đăng nhập",
          },
        ]}
      />
    </div>
  );
}
