import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

import { frontendApi } from "@/lib/kratos/client";
import { kratosBrowserUrl } from "@/lib/kratos/config";

export const dynamic = "force-dynamic";

function sameOrigin(request: Request, path: string): URL {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost || request.headers.get("host") || "")
    .split(",")[0]
    .trim();
  if (!host || host.startsWith("0.0.0.0") || host.startsWith("[")) {
    return new URL(path, "https://id.vietso.online");
  }
  const proto = (request.headers.get("x-forwarded-proto") || "https")
    .split(",")[0]
    .trim();
  return new URL(path, `${proto}://${host}`);
}

function logoutTarget(value: string): URL | null {
  let target: URL;
  try {
    target = new URL(value);
  } catch {
    return null;
  }
  const browser = new URL(kratosBrowserUrl());
  const expectedPath = `${browser.pathname.replace(/\/$/, "")}/self-service/logout`;
  if (target.origin !== browser.origin || target.pathname !== expectedPath) {
    return null;
  }
  if (!target.searchParams.get("token")) {
    return null;
  }
  return target;
}

export async function GET(request: Request) {
  const api = frontendApi(request.headers.get("accept-language") ?? undefined);
  const login = sameOrigin(request, "/login");
  try {
    const { data } = await api.createBrowserLogoutFlow({
      cookie: request.headers.get("cookie") ?? undefined,
    });
    const target = logoutTarget(data.logout_url);
    if (!target) {
      return NextResponse.redirect(login, 303);
    }
    return NextResponse.redirect(target, 303);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) {
      return NextResponse.redirect(login, 303);
    }
    return NextResponse.redirect(sameOrigin(request, "/error"), 303);
  }
}
