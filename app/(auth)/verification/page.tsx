import { UiText } from "@ory/client";
import { redirect } from "next/navigation";

import { AuthLinks } from "@/components/kratos/auth-links";
import { FlowForm } from "@/components/kratos/flow-form";
import { frontendApi, requestCookie, requestLanguage } from "@/lib/kratos/client";
import { appPath, getUrlForFlow, kratosBrowserUrl } from "@/lib/kratos/config";
import { loadOrRedirect } from "@/lib/kratos/errors";
import { first, isQuerySet, type Search } from "@/lib/kratos/query";

export const metadata = { title: "Xác minh tài khoản" };

function extraMessages(raw: string): UiText[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is UiText =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as UiText).text === "string" &&
        typeof (item as UiText).id === "number",
    );
  } catch {
    return [];
  }
}

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const flowId = isQuerySet(query.flow) ? query.flow : "";
  const returnTo = first(query.return_to);
  const init = getUrlForFlow(kratosBrowserUrl(), "verification", {
    return_to: returnTo,
  });

  if (!flowId) {
    redirect(init);
  }

  const flow = await loadOrRedirect(async () => {
    return frontendApi(await requestLanguage())
      .getVerificationFlow({ id: flowId, cookie: await requestCookie() })
      .then((res) => res.data);
  }, init);

  const added = extraMessages(first(query.message));
  if (added.length > 0) {
    flow.ui.messages = [...(flow.ui.messages || []), ...added];
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">Xác minh tài khoản</h1>
        <p className="text-sm text-secondary-foreground">
          Nhập mã hoặc mở liên kết xác minh được gửi tới email.
        </p>
      </div>
      <FlowForm ui={flow.ui} />
      <AuthLinks
        links={[
          {
            href: appPath("/registration", {
              return_to: returnTo || flow.return_to || "",
            }),
            label: "Tạo tài khoản mới",
          },
        ]}
      />
    </div>
  );
}
