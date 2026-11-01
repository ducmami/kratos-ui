import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Configuration, FrontendApi } from "@ory/client";
import axios from "axios";

export type FlowKind =
  | "login"
  | "registration"
  | "recovery"
  | "verification"
  | "settings";

const INIT_QUERY_KEYS: Record<FlowKind, readonly string[]> = {
  login: [
    "aal",
    "refresh",
    "return_to",
    "organization",
    "via",
    "login_challenge",
    "identity_schema",
  ],
  registration: [
    "return_to",
    "login_challenge",
    "organization",
    "identity_schema",
    "after_verification_return_to",
  ],
  recovery: ["return_to"],
  verification: ["return_to"],
  settings: ["return_to"],
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến ${name}`);
  }
  return value.replace(/\/$/, "");
}

export function kratosBrowserUrl(): string {
  return requiredEnv("KRATOS_BROWSER_URL");
}

export function kratosFrontend(): FrontendApi {
  return new FrontendApi(
    new Configuration({
      basePath: requiredEnv("KRATOS_PUBLIC_URL"),
    }),
  );
}

export async function cookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export function firstQuery(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export type SearchParams = Record<string, string | string[] | undefined>;

export function initQuery(
  kind: FlowKind,
  searchParams: SearchParams,
): URLSearchParams {
  const query = new URLSearchParams();
  for (const key of INIT_QUERY_KEYS[kind]) {
    const value = firstQuery(searchParams[key]);
    if (value) {
      query.set(key, value);
    }
  }
  return query;
}

export function getUrlForFlow(
  base: string,
  flow: FlowKind,
  query?: URLSearchParams,
): string {
  const qs = query?.toString();
  return `${base.replace(/\/$/, "")}/self-service/${flow}/browser${qs ? `?${qs}` : ""}`;
}

type AssuranceLevelError = {
  error?: { id?: string };
  redirect_browser_to?: string;
};

export function redirectOnSoftError(err: unknown, redirectTo: string): void {
  if (!axios.isAxiosError(err) || !err.response) {
    throw err;
  }

  const status = err.response.status;
  if (status === 401) {
    const query = new URLSearchParams();
    query.set("return_to", redirectTo);
    redirect(getUrlForFlow(kratosBrowserUrl(), "login", query));
  }

  if (status === 404 || status === 410 || status === 403) {
    const data = err.response.data as AssuranceLevelError;
    if (
      data?.error?.id === "session_aal2_required" &&
      data.redirect_browser_to
    ) {
      redirect(data.redirect_browser_to);
    }
    redirect(redirectTo);
  }

  throw err;
}
