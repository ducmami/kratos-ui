import { redirect } from "next/navigation";

import { AuthLinks } from "@/components/kratos/auth-links";
import { FlowForm } from "@/components/kratos/flow-form";
import { frontendApi, requestCookie, requestLanguage } from "@/lib/kratos/client";
import { appPath, getUrlForFlow, kratosBrowserUrl } from "@/lib/kratos/config";
import { loadOrRedirect } from "@/lib/kratos/errors";
import { first, isQuerySet, type Search } from "@/lib/kratos/query";

export const metadata = { title: "Đăng ký" };

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const flowId = isQuerySet(query.flow) ? query.flow : "";
  const returnTo = first(query.return_to);
  const init = getUrlForFlow(kratosBrowserUrl(), "registration", {
    return_to: returnTo,
    organization: first(query.organization),
    identity_schema: first(query.identity_schema),
    after_verification_return_to: first(query.after_verification_return_to),
    login_challenge: first(query.login_challenge),
  });

  if (!flowId) {
    redirect(init);
  }

  const api = frontendApi(await requestLanguage());
  const cookie = await requestCookie();
  const flow = await loadOrRedirect(
    () => api.getRegistrationFlow({ id: flowId, cookie }).then((res) => res.data),
    init,
  );

  const returnTarget = returnTo || flow.return_to || "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">Tạo tài khoản</h1>
        <p className="text-sm text-secondary-foreground">
          Đăng ký bằng tên đăng nhập, email và mật khẩu. Mật khẩu do hệ thống kiểm tra.
        </p>
      </div>
      <FlowForm ui={flow.ui} />
      <AuthLinks
        links={[
          {
            href: appPath("/login", {
              return_to: returnTarget,
              identity_schema: flow.identity_schema,
              login_challenge: flow.oauth2_login_request?.challenge,
            }),
            label: "Đã có tài khoản? Đăng nhập",
          },
        ]}
      />
    </div>
  );
}
