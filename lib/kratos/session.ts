import { Session } from "@ory/client";
import { isAxiosError } from "axios";

import { frontendApi, requestCookie, requestLanguage } from "./client";
import { getUrlForFlow, kratosBrowserUrl } from "./config";

export type SessionRead =
  | { kind: "session"; session: Session }
  | { kind: "aal2"; redirectTo: string }
  | { kind: "none" };

export async function readSession(): Promise<SessionRead> {
  const api = frontendApi(await requestLanguage());
  const cookie = await requestCookie();
  try {
    const { data } = await api.toSession({ cookie });
    return { kind: "session", session: data };
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 403) {
      const body = err.response.data as {
        error?: { id?: string };
        redirect_browser_to?: string;
      };
      if (body.error?.id === "session_aal2_required") {
        return {
          kind: "aal2",
          redirectTo:
            body.redirect_browser_to ||
            getUrlForFlow(kratosBrowserUrl(), "login", { aal: "aal2" }),
        };
      }
    }
    return { kind: "none" };
  }
}

export async function logoutUrl(returnTo?: string): Promise<string> {
  const api = frontendApi(await requestLanguage());
  try {
    const { data } = await api.createBrowserLogoutFlow({
      cookie: await requestCookie(),
      ...(returnTo ? { returnTo } : {}),
    });
    return data.logout_url;
  } catch {
    return "";
  }
}

export function identityLabel(session: Session | undefined): string {
  const traits = session?.identity?.traits as
    | Record<string, unknown>
    | undefined;
  const email = traits?.email;
  const username = traits?.username;
  if (typeof email === "string" && email) {
    return email;
  }
  if (typeof username === "string" && username) {
    return username;
  }
  return session?.identity?.id ?? "";
}
