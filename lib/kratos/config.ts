export type BrowserFlow =
  | "login"
  | "registration"
  | "recovery"
  | "verification"
  | "settings";

function trimSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function envValue(name: string): string {
  return process.env[name] || "";
}

export function kratosPublicUrl(): string {
  const url = envValue("KRATOS_PUBLIC_URL") || envValue("ORY_SDK_URL");
  if (!url) {
    throw new Error("KRATOS_PUBLIC_URL is required");
  }
  return trimSlash(url);
}

export function kratosBrowserUrl(): string {
  return trimSlash(envValue("KRATOS_BROWSER_URL") || kratosPublicUrl());
}

export function hydraAdminUrl(): string | null {
  const url = envValue("HYDRA_ADMIN_URL") || envValue("ORY_SDK_URL");
  return url ? trimSlash(url) : null;
}

export function isOAuthConsentRouteEnabled(): boolean {
  return Boolean(
    hydraAdminUrl() &&
      envValue("CSRF_COOKIE_SECRET") &&
      envValue("CSRF_COOKIE_NAME"),
  );
}

export function getUrlForFlow(
  base: string,
  flow: BrowserFlow,
  query?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params.set(key, value);
      }
    }
  }
  const qs = params.toString();
  return `${trimSlash(base)}/self-service/${flow}/browser${qs ? `?${qs}` : ""}`;
}

export function appPath(
  path: string,
  query?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params.set(key, value);
      }
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

const FLOW_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isFlowId(value: string): boolean {
  return FLOW_ID.test(value);
}

export function runtimeSecretsProblem(): string | null {
  const cookieSecret = envValue("COOKIE_SECRET");
  const csrfName = envValue("CSRF_COOKIE_NAME");
  const csrfSecret = envValue("CSRF_COOKIE_SECRET");
  const adminToken = envValue("ORY_ADMIN_API_TOKEN");
  if (
    (adminToken && cookieSecret.length < 8) ||
    csrfName.length === 0 ||
    csrfSecret.length < 8
  ) {
    return "Không khởi động được: CSRF_COOKIE_NAME, CSRF_COOKIE_SECRET (ít nhất 8 ký tự) là bắt buộc. Khi có ORY_ADMIN_API_TOKEN thì COOKIE_SECRET cũng phải dài ít nhất 8 ký tự.";
  }
  return null;
}
