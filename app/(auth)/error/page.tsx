import { FlowError, GenericError } from "@ory/client";
import { isAxiosError } from "axios";
import { headers } from "next/headers";

import { AuthLinks } from "@/components/kratos/auth-links";
import { frontendApi, requestLanguage } from "@/lib/kratos/client";
import { first, isQuerySet, type Search } from "@/lib/kratos/query";

export const metadata = { title: "Đã xảy ra lỗi" };

function linesFrom(error: GenericError | undefined): string[] {
  if (!error) {
    return [];
  }
  return [error.message, error.reason, error.status].filter(
    (line): line is string => Boolean(line),
  );
}

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const api = frontendApi(await requestLanguage());
  let title = "Đã xảy ra lỗi";
  let lines: string[] = [];

  try {
    if (isQuerySet(query.error)) {
      const hint = first(query.error_hint);
      lines = [
        decodeURIComponent(first(query.error_description) || "No description provided"),
        hint ? decodeURIComponent(hint) : "",
      ].filter(Boolean);
      title = "OAuth2 Error";
    } else if (isQuerySet(query.id)) {
      const { data } = await api.getFlowError({ id: query.id });
      const body = data.error as GenericError | undefined;
      title = body?.status || title;
      lines = linesFrom(body);
      if (lines.length === 0) {
        lines = [data.id];
      }
    } else {
      lines = ["Không có mã lỗi trên đường dẫn."];
    }
  } catch (err) {
    let flowError: FlowError | undefined;
    if (isAxiosError(err)) {
      flowError = err.response?.data as FlowError | undefined;
    }
    const body = flowError?.error as GenericError | undefined;
    lines = linesFrom(body);
    if (lines.length === 0) {
      lines = ["Không đọc được chi tiết lỗi."];
    }
  }

  const referer = (await headers()).get("referer");
  let back = "/welcome";
  if (referer) {
    try {
      const url = new URL(referer);
      back = `${url.pathname}${url.search}`;
    } catch {
      back = "/welcome";
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">{title}</h1>
        {lines.map((line) => (
          <p key={line} className="text-sm text-secondary-foreground">
            {line}
          </p>
        ))}
      </div>
      <AuthLinks links={[{ href: back, label: "Quay lại" }]} />
    </div>
  );
}
