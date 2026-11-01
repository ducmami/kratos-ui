import { NextResponse } from "next/server";

import { frontendApi } from "@/lib/kratos/client";
import { appendSetCookies, readSetCookie } from "@/lib/kratos/set-cookie";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const flowId = url.searchParams.get("flow") || "";
  const returnTo = url.searchParams.get("return_to") || "";
  if (!flowId) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const api = frontendApi(request.headers.get("accept-language") ?? undefined);
  const cookie = request.headers.get("cookie") ?? undefined;
  const login = await api.getLoginFlow({ id: flowId, cookie });
  const created = await api.createBrowserVerificationFlow({
    returnTo: returnTo || login.data.return_to || "",
  });
  const params = new URLSearchParams({
    flow: created.data.id,
    message: JSON.stringify(login.data.ui.messages ?? []),
  });
  const response = NextResponse.redirect(
    new URL(`/verification?${params.toString()}`, request.url),
    303,
  );
  appendSetCookies(response, readSetCookie(created.headers));
  return response;
}
