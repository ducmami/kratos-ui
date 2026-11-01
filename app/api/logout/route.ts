import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { oauth2Api } from "@/lib/kratos/client";
import { csrfCookieName, verifyCsrf } from "@/lib/kratos/csrf";

export async function POST(request: Request) {
  const form = await request.formData();
  const jar = await cookies();
  const csrfOk = await verifyCsrf(
    jar.get(csrfCookieName())?.value,
    String(form.get("_csrf") ?? ""),
  );
  if (!csrfOk) {
    return new Response("CSRF token không hợp lệ", { status: 403 });
  }

  const challenge = String(form.get("challenge") ?? "");
  const submit = String(form.get("submit") ?? "");
  const oauth = oauth2Api();
  const login = NextResponse.redirect(new URL("/login", request.url), 303);
  if (!oauth || !challenge) {
    return login;
  }

  try {
    if (submit === "No") {
      await oauth.rejectOAuth2LogoutRequest({ logoutChallenge: challenge });
      return login;
    }
    const accepted = await oauth.acceptOAuth2LogoutRequest({
      logoutChallenge: challenge,
    });
    return NextResponse.redirect(accepted.data.redirect_to, 303);
  } catch {
    return login;
  }
}
