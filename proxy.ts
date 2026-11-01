import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  csrfCookieName,
  csrfCookieSecure,
  csrfHeaderName,
  issueCsrfToken,
  tokenFromCookie,
} from "@/lib/kratos/csrf";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/welcome", request.url), 303);
  }

  if (
    request.method === "POST" &&
    (pathname === "/consent" || pathname === "/logout")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/consent" ? "/api/consent" : "/api/logout";
    return NextResponse.rewrite(url);
  }

  if (
    request.method === "GET" &&
    (pathname === "/consent" || pathname === "/logout")
  ) {
    const name = csrfCookieName();
    const existing = request.cookies.get(name)?.value;
    const current = await tokenFromCookie(existing);
    const issued = current ? null : await issueCsrfToken();
    const token = current ?? issued?.token ?? "";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(csrfHeaderName(), token);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    if (issued) {
      response.cookies.set(name, issued.cookieValue, {
        httpOnly: true,
        sameSite: "lax",
        secure: csrfCookieSecure(),
        path: "/",
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/consent", "/logout"],
};
