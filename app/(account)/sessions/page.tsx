import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUrlForFlow, kratosBrowserUrl } from "@/lib/kratos/config";
import { identityLabel, readSession } from "@/lib/kratos/session";

export const metadata = { title: "Phiên đăng nhập" };

export default async function SessionsPage() {
  const session = await readSession();
  if (session.kind === "aal2") {
    redirect(session.redirectTo);
  }
  if (session.kind === "none") {
    redirect(getUrlForFlow(kratosBrowserUrl(), "login"));
  }

  const current = session.session;
  const traits = (current.identity?.traits ?? {}) as Record<string, unknown>;
  const rows: Array<[string, string]> = [
    ["Định danh", current.identity?.id ?? ""],
    ["Tài khoản", identityLabel(current)],
    [
      "Mức xác thực",
      current.authenticator_assurance_level === "aal2"
        ? "Hai yếu tố (aal2)"
        : "Một yếu tố (aal1)",
    ],
  ];
  if (current.identity?.created_at) {
    rows.push(["Ngày tạo", new Date(current.identity.created_at).toUTCString()]);
  }
  if (current.authenticated_at) {
    rows.push(["Xác thực lúc", new Date(current.authenticated_at).toUTCString()]);
  }
  if (current.expires_at) {
    rows.push(["Hết hạn", new Date(current.expires_at).toUTCString()]);
  }
  for (const [key, value] of Object.entries(traits)) {
    rows.push([
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value ?? ""),
    ]);
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-mono">Phiên đăng nhập</h1>
        <p className="text-sm text-secondary-foreground">
          Phiên này nằm trong cookie của trình duyệt.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-secondary-foreground">{key}</span>
              <span className="text-end font-medium break-all">{value}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {current.authentication_methods?.map((method, index) => (
              <Badge key={`${method.method}-${index}`} variant="secondary">
                {method.method}
                {method.completed_at
                  ? ` · ${new Date(method.completed_at).toUTCString()}`
                  : ""}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
            {JSON.stringify(current, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
