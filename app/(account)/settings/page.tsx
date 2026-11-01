import { redirect } from "next/navigation";

import { FlowForm } from "@/components/kratos/flow-form";
import { frontendApi, requestCookie, requestLanguage } from "@/lib/kratos/client";
import {
  getUrlForFlow,
  isFlowId,
  kratosBrowserUrl,
} from "@/lib/kratos/config";
import { loadOrRedirect } from "@/lib/kratos/errors";
import { first, isQuerySet, type Search } from "@/lib/kratos/query";
import { readSession } from "@/lib/kratos/session";

export const metadata = { title: "Cài đặt" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const flowId = isQuerySet(query.flow) ? query.flow : "";
  const returnTo = first(query.return_to);
  const init = getUrlForFlow(kratosBrowserUrl(), "settings", {
    return_to: returnTo,
  });

  if (!(flowId && isFlowId(flowId))) {
    const session = await readSession();
    if (session.kind === "aal2") {
      redirect(session.redirectTo);
    }
    if (session.kind === "none") {
      redirect(getUrlForFlow(kratosBrowserUrl(), "login"));
    }
  }

  if (!flowId) {
    redirect(init);
  }

  const flow = await loadOrRedirect(async () => {
    return frontendApi(await requestLanguage())
      .getSettingsFlow({ id: flowId, cookie: await requestCookie() })
      .then((res) => res.data);
  }, init);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-mono">Cài đặt tài khoản</h1>
        <p className="text-sm text-secondary-foreground">
          Email hiện chưa đổi được. Đổi mật khẩu có thể yêu cầu đăng nhập lại.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <FlowForm ui={flow.ui} readOnlyNames={["traits.email"]} />
      </div>
    </>
  );
}
