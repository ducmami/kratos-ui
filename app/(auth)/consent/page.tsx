import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { oauth2Api } from "@/lib/kratos/client";
import { extractSession } from "@/lib/kratos/consent-session";
import { csrfHeaderName } from "@/lib/kratos/csrf";
import { isOAuthConsentRouteEnabled } from "@/lib/kratos/config";
import { shouldSkipConsent } from "@/lib/kratos/oidc-cert";
import { first, type Search } from "@/lib/kratos/query";
import { readSession } from "@/lib/kratos/session";

export const metadata = { title: "Cấp quyền" };

function scopeLabel(scope: string): string {
  switch (scope) {
    case "openid":
      return "Định danh (openid)";
    case "email":
      return "Email";
    case "profile":
      return "Hồ sơ";
    case "offline":
    case "offline_access":
      return "Truy cập ngoại tuyến";
    default:
      return scope;
  }
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!isOAuthConsentRouteEnabled()) {
    notFound();
  }

  const challenge = first((await searchParams).consent_challenge);
  if (!challenge) {
    return (
      <p className="text-sm text-secondary-foreground">Thiếu mã consent.</p>
    );
  }

  const session = await readSession();
  if (session.kind === "aal2") {
    redirect(session.redirectTo);
  }

  const oauth = oauth2Api();
  if (!oauth) {
    notFound();
  }

  const { data: body } = await oauth.getOAuth2ConsentRequest({
    consentChallenge: challenge,
  });

  if (shouldSkipConsent(body)) {
    const grantScope = body.requested_scope || [];
    const accepted = await oauth.acceptOAuth2ConsentRequest({
      consentChallenge: challenge,
      acceptOAuth2ConsentRequest: {
        grant_scope: grantScope,
        grant_access_token_audience: body.requested_access_token_audience,
        session: extractSession(
          session.kind === "session" ? session.session : undefined,
          grantScope,
        ),
      },
    });
    redirect(accepted.data.redirect_to);
  }

  const token = (await headers()).get(csrfHeaderName()) || "";
  const clientName =
    body.client?.client_name || body.client?.client_id || "Ứng dụng";
  const scopes = body.requested_scope || [];

  return (
    <form action="/consent" method="post" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">Cấp quyền</h1>
        <p className="text-sm text-secondary-foreground">
          {clientName} xin các quyền sau.
        </p>
      </div>
      <input type="hidden" name="_csrf" value={token} />
      <input type="hidden" name="consent_challenge" value={challenge} />
      <div className="flex flex-col gap-2">
        {scopes.map((scope) => (
          <label key={scope} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="grant_scope"
              value={scope}
              defaultChecked
              className="size-4 rounded border border-input accent-primary"
            />
            {scopeLabel(scope)}
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="remember"
          value="true"
          className="size-4 rounded border border-input accent-primary"
        />
        Ghi nhớ lựa chọn này
      </label>
      <div className="flex flex-col gap-2">
        <Button type="submit" name="consent_action" value="accept" size="lg">
          Đồng ý
        </Button>
        <Button
          type="submit"
          name="consent_action"
          value="reject"
          variant="outline"
          size="lg"
        >
          Từ chối
        </Button>
      </div>
    </form>
  );
}
