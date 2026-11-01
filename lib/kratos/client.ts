import { Configuration, FrontendApi, OAuth2Api } from "@ory/client";
import { headers } from "next/headers";

import { hydraAdminUrl, kratosPublicUrl } from "./config";

export async function requestCookie(): Promise<string | undefined> {
  const headerList = await headers();
  return headerList.get("cookie") ?? undefined;
}

export async function requestLanguage(): Promise<string | undefined> {
  const headerList = await headers();
  return headerList.get("accept-language") ?? undefined;
}

export function frontendApi(acceptLanguage?: string): FrontendApi {
  return new FrontendApi(
    new Configuration({
      basePath: kratosPublicUrl(),
      baseOptions: {
        headers: {
          ...(acceptLanguage ? { "Accept-Language": acceptLanguage } : {}),
        },
      },
    }),
  );
}

export function oauth2Api(): OAuth2Api | null {
  const basePath = hydraAdminUrl();
  if (!basePath) {
    return null;
  }
  return new OAuth2Api(
    new Configuration({
      basePath,
      ...(process.env.ORY_ADMIN_API_TOKEN
        ? { accessToken: process.env.ORY_ADMIN_API_TOKEN }
        : {}),
      ...(process.env.MOCK_TLS_TERMINATION
        ? { baseOptions: { headers: { "X-Forwarded-Proto": "https" } } }
        : {}),
    }),
  );
}
