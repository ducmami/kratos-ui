import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { oauth2Api } from "@/lib/kratos/client";
import { extractSession, rememberForSeconds } from "@/lib/kratos/consent-session";
import { csrfCookieName, verifyCsrf } from "@/lib/kratos/csrf";
import { isOAuthConsentRouteEnabled } from "@/lib/kratos/config";
import { oidcConformityMaybeFakeSession } from "@/lib/kratos/oidc-cert";
import { readSession } from "@/lib/kratos/session";

export async function POST(request: Request) {
  if (!isOAuthConsentRouteEnabled()) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const form = await request.formData();
  const jar = await cookies();
  const csrfOk = await verifyCsrf(
    jar.get(csrfCookieName())?.value,
    String(form.get("_csrf") ?? ""),
  );
  if (!csrfOk) {
    return new Response("CSRF token không hợp lệ", { status: 403 });
  }

  const challenge = String(form.get("consent_challenge") ?? "");
  const action = String(form.get("consent_action") ?? "");
  const grantScope = form
    .getAll("grant_scope")
    .map((value) => String(value))
    .filter((value) => value.length > 0);
  const oauth = oauth2Api();
  if (!oauth || !challenge) {
    return new Response("Không xử lý được consent", { status: 500 });
  }

  const sessionRead = await readSession();
  const session = extractSession(
    sessionRead.kind === "session" ? sessionRead.session : undefined,
    grantScope,
  );

  if (action === "accept") {
    const current = await oauth.getOAuth2ConsentRequest({
      consentChallenge: challenge,
    });
    const accepted = await oauth.acceptOAuth2ConsentRequest({
      consentChallenge: challenge,
      acceptOAuth2ConsentRequest: {
        grant_scope: grantScope,
        grant_access_token_audience:
          current.data.requested_access_token_audience,
        session: oidcConformityMaybeFakeSession(grantScope, session),
        remember: Boolean(form.get("remember")),
        remember_for: rememberForSeconds(),
      },
    });
    return NextResponse.redirect(accepted.data.redirect_to, 303);
  }

  const rejected = await oauth.rejectOAuth2ConsentRequest({
    consentChallenge: challenge,
    rejectOAuth2Request: {
      error: "access_denied",
      error_description: "The resource owner denied the request",
    },
  });
  return NextResponse.redirect(rejected.data.redirect_to, 303);
}
