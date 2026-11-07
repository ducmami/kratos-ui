import { redirect } from "next/navigation";

import { AuthLinks } from "@/components/kratos/auth-links";
import { FlowForm } from "@/components/kratos/flow-form";
import { frontendApi, requestCookie, requestLanguage } from "@/lib/kratos/client";
import { appPath, getUrlForFlow, kratosBrowserUrl } from "@/lib/kratos/config";
import { loadOrRedirect } from "@/lib/kratos/errors";
import { first, isQuerySet, type Search } from "@/lib/kratos/query";

export const metadata = { title: "Đăng nhập" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const flowId = isQuerySet(query.flow) ? query.flow : "";
  const returnTo = first(query.return_to);
  const init = getUrlForFlow(kratosBrowserUrl(), "login", {
    aal: first(query.aal),
    refresh: first(query.refresh),
    return_to: returnTo,
    organization: first(query.organization),
    via: first(query.via),
    login_challenge: first(query.login_challenge),
    identity_schema: first(query.identity_schema),
  });

  if (!flowId) {
    redirect(init);
  }

  const api = frontendApi(await requestLanguage());
  const cookie = await requestCookie();
  const flow = await loadOrRedirect(
    () => api.getLoginFlow({ id: flowId, cookie }).then((res) => res.data),
    init,
  );

  if (flow.ui.messages?.some((message) => message.id === 4000010)) {
    const params = new URLSearchParams({ flow: flow.id });
    const nextReturn = returnTo || flow.return_to || "";
    if (nextReturn) {
      params.set("return_to", nextReturn);
    }
    redirect(`/api/continue-verification?${params.toString()}`);
  }

  const returnTarget = returnTo || flow.return_to || "";
  const links = [
    {
      href: appPath("/registration", {
        return_to: returnTarget,
        identity_schema: flow.identity_schema,
        login_challenge: flow.oauth2_login_request?.challenge,
      }),
      label: "Chưa có tài khoản? Đăng ký",
    },
  ];
  if (!flow.refresh) {
    links.push({
      href: appPath("/recovery", { return_to: returnTarget }),
      label: "Quên mật khẩu?",
    });
  }
  if (flow.requested_aal === "aal2" || flow.refresh) {
    try {
      const logout = await api.createBrowserLogoutFlow({
        cookie,
        returnTo: returnTarget,
      });
      if (logout.data.logout_url) {
        links.push({ href: logout.data.logout_url, label: "Đăng xuất" });
      }
    } catch {
      // Không có phiên để đăng xuất.
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">Đăng nhập</h1>
        <p className="text-sm text-secondary-foreground">
          Dùng tên đăng nhập hoặc email và mật khẩu của tài khoản Viết Sớ.
        </p>
      </div>
      <FlowForm ui={flow.ui} />
      <AuthLinks links={links} />
    </div>
  );
}
