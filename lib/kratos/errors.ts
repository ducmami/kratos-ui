import { isAxiosError } from "axios";
import { redirect } from "next/navigation";

import { getUrlForFlow, kratosBrowserUrl } from "./config";

type AalErrorBody = {
  error?: { id?: string };
  redirect_browser_to?: string;
};

function isAal2(data: unknown): data is AalErrorBody {
  if (!data || typeof data !== "object") {
    return false;
  }
  return (data as AalErrorBody).error?.id === "session_aal2_required";
}

export function flowErrorRedirect(err: unknown, retryUrl: string): string | null {
  if (!isAxiosError(err) || !err.response) {
    return null;
  }

  if (err.response.status === 401) {
    return getUrlForFlow(kratosBrowserUrl(), "login", {
      return_to: retryUrl,
    });
  }

  if (
    err.response.status === 404 ||
    err.response.status === 410 ||
    err.response.status === 403
  ) {
    if (isAal2(err.response.data)) {
      return err.response.data.redirect_browser_to || retryUrl;
    }
    return retryUrl;
  }

  return null;
}

export function rethrowIfRedirect(err: unknown): void {
  if (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw err;
  }
}

export async function loadOrRedirect<T>(
  load: () => Promise<T>,
  retryUrl: string,
): Promise<T> {
  try {
    return await load();
  } catch (err) {
    const target = flowErrorRedirect(err, retryUrl);
    if (target) {
      redirect(target);
    }
    throw err;
  }
}
