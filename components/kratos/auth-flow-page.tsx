import Link from "next/link";
import { redirect } from "next/navigation";
import type {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  UiText,
  VerificationFlow,
} from "@ory/client";
import { FlowForm } from "@/components/kratos/flow-form";
import {
  cookieHeader,
  firstQuery,
  getUrlForFlow,
  initQuery,
  kratosBrowserUrl,
  kratosFrontend,
  redirectOnSoftError,
  type FlowKind,
  type SearchParams,
} from "@/lib/kratos";

const TITLES: Record<FlowKind, string> = {
  login: "Đăng nhập",
  registration: "Đăng ký",
  recovery: "Quên mật khẩu",
  verification: "Xác minh email",
  settings: "Cài đặt",
};

type AnyFlow =
  | LoginFlow
  | RegistrationFlow
  | RecoveryFlow
  | VerificationFlow
  | SettingsFlow;

const VERIFY_REQUIRED_MESSAGE_ID = 4000010;

async function loadFlow(
  kind: FlowKind,
  id: string,
  cookie: string,
): Promise<AnyFlow> {
  const frontend = kratosFrontend();
  switch (kind) {
    case "login":
      return (await frontend.getLoginFlow({ id, cookie })).data;
    case "registration":
      return (await frontend.getRegistrationFlow({ id, cookie })).data;
    case "recovery":
      return (await frontend.getRecoveryFlow({ id, cookie })).data;
    case "verification":
      return (await frontend.getVerificationFlow({ id, cookie })).data;
    case "settings":
      return (await frontend.getSettingsFlow({ id, cookie })).data;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function isUiText(value: unknown): value is UiText {
  if (!value || typeof value !== "object") {
    return false;
  }
  const message = value as Partial<UiText>;
  return (
    typeof message.id === "number" &&
    typeof message.text === "string" &&
    (message.type === "info" ||
      message.type === "error" ||
      message.type === "success")
  );
}

function parseMessages(raw: string): UiText[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const messages = parsed.filter(isUiText);
    return messages.length > 0 ? messages : null;
  } catch {
    return null;
  }
}

function withReturn(path: string, returnTo: string): string {
  if (!returnTo) {
    return path;
  }
  return `${path}?return_to=${encodeURIComponent(returnTo)}`;
}

function FlowFooter({
  kind,
  returnTo,
}: {
  kind: FlowKind;
  returnTo: string;
}) {
  switch (kind) {
    case "login":
      return (
        <div className="space-y-2 text-center text-sm">
          <div>
            <Link
              className="font-medium text-primary"
              href={withReturn("/recovery", returnTo)}
            >
              Quên mật khẩu
            </Link>
          </div>
          <p className="text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              className="font-medium text-primary"
              href={withReturn("/registration", returnTo)}
            >
              Đăng ký
            </Link>
          </p>
        </div>
      );
    case "registration":
      return (
        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            className="font-medium text-primary"
            href={withReturn("/login", returnTo)}
          >
            Đăng nhập
          </Link>
        </p>
      );
    case "recovery":
      return (
        <p className="text-center text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary"
            href={withReturn("/login", returnTo)}
          >
            Đăng nhập
          </Link>
        </p>
      );
    case "verification":
      return (
        <p className="text-center text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary"
            href={withReturn("/registration", returnTo)}
          >
            Đăng ký
          </Link>
        </p>
      );
    case "settings":
      return (
        <form action="/logout" method="post" className="text-center text-sm">
          <button type="submit" className="font-medium text-primary">
            Đăng xuất
          </button>
        </form>
      );
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export async function AuthFlowPage({
  kind,
  searchParams,
}: {
  kind: FlowKind;
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const initUrl = getUrlForFlow(
    kratosBrowserUrl(),
    kind,
    initQuery(kind, query),
  );
  const flowId = firstQuery(query.flow);

  if (!flowId) {
    redirect(initUrl);
  }

  const cookie = await cookieHeader();
  let flow: AnyFlow;
  try {
    flow = await loadFlow(kind, flowId, cookie);
  } catch (err) {
    redirectOnSoftError(err, initUrl);
    throw err;
  }

  const returnTo = firstQuery(query.return_to) || flow.return_to || "";

  if (
    kind === "login" &&
    flow.ui.messages?.some(
      (message) => message.id === VERIFY_REQUIRED_MESSAGE_ID,
    )
  ) {
    const verificationQuery = new URLSearchParams();
    if (returnTo) {
      verificationQuery.set("return_to", returnTo);
    }
    redirect(getUrlForFlow(kratosBrowserUrl(), "verification", verificationQuery));
  }

  if (kind === "verification") {
    const extra = parseMessages(firstQuery(query.message));
    if (extra) {
      flow.ui.messages = [...(flow.ui.messages ?? []), ...extra];
    }
  }

  return (
    <FlowForm
      title={TITLES[kind]}
      action={flow.ui.action}
      method={flow.ui.method}
      nodes={flow.ui.nodes}
      messages={flow.ui.messages}
      footer={<FlowFooter kind={kind} returnTo={returnTo} />}
    />
  );
}
