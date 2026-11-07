"use client";

import { useEffect, useState } from "react";
import {
  UiNode,
  UiNodeGroupEnum,
  UiNodeInputAttributes,
  UiNodeInputAttributesOnclickTriggerEnum,
  UiNodeInputAttributesOnloadTriggerEnum,
  UiNodeInputAttributesTypeEnum,
  UiText,
  UiTextTypeEnum,
} from "@ory/client";
import { Eye, EyeOff } from "lucide-react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type FlowUi = {
  action: string;
  method: string;
  messages?: Array<UiText>;
  nodes: Array<UiNode>;
};

const GROUP_ORDER: UiNodeGroupEnum[] = [
  "oidc",
  "saml",
  "default",
  "identifier_first",
  "profile",
  "password",
  "code",
  "link",
  "totp",
  "lookup_secret",
  "webauthn",
  "passkey",
  "captcha",
  "deviceauthn",
  "oauth2_consent",
  "11184809",
];

function groupTitle(group: UiNodeGroupEnum): string | null {
  switch (group) {
    case "password":
      return "Mật khẩu";
    case "oidc":
      return "Tài khoản liên kết";
    case "profile":
      return "Hồ sơ";
    case "code":
      return "Mã xác nhận";
    case "link":
      return "Liên kết";
    case "totp":
      return "Ứng dụng xác thực";
    case "lookup_secret":
      return "Mã dự phòng";
    case "webauthn":
      return "Khóa bảo mật";
    case "passkey":
      return "Passkey";
    case "captcha":
      return "Xác minh";
    case "saml":
      return "SAML";
    case "deviceauthn":
      return "Thiết bị";
    case "default":
    case "identifier_first":
    case "oauth2_consent":
    case "11184809":
      return null;
    default: {
      const exhaustive: never = group;
      return exhaustive;
    }
  }
}

function messageVariant(
  type: UiTextTypeEnum,
): "destructive" | "info" | "success" | "secondary" {
  switch (type) {
    case "error":
      return "destructive";
    case "info":
      return "info";
    case "success":
      return "success";
    case "11184809":
      return "secondary";
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}

function scalarValue(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function nodeLabel(node: UiNode): string {
  if (node.attributes.node_type === "input" && node.attributes.name === "identifier") {
    return "Email hoặc tên đăng nhập";
  }
  return node.meta.label?.text || "";
}

function fieldHint(name: string, locked: boolean): string | undefined {
  if (locked && name === "traits.email") {
    return "Chưa đổi được email.";
  }
  if (locked && name === "traits.username") {
    return "Chưa đổi được tên đăng nhập.";
  }
  if (name === "traits.username") {
    return "Chữ thường, bắt đầu bằng chữ cái, chỉ a-z và số, 3–50 ký tự.";
  }
  return undefined;
}

function callTrigger(
  trigger:
    | UiNodeInputAttributesOnclickTriggerEnum
    | UiNodeInputAttributesOnloadTriggerEnum
    | undefined,
): void {
  if (!trigger || trigger === "11184809") {
    return;
  }
  switch (trigger) {
    case "oryWebAuthnRegistration":
    case "oryWebAuthnLogin":
    case "oryPasskeyLogin":
    case "oryPasskeyLoginAutocompleteInit":
    case "oryPasskeyRegistration":
    case "oryPasskeySettingsRegistration": {
      const fn = (window as unknown as Record<string, unknown>)[trigger];
      if (typeof fn === "function") {
        fn();
      }
      return;
    }
    default: {
      const exhaustive: never = trigger;
      void exhaustive;
    }
  }
}

function Messages({ messages }: { messages?: Array<UiText> }) {
  if (!messages || messages.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      {messages.map((message) => (
        <Alert
          key={`${message.id}-${message.text}`}
          variant={messageVariant(message.type)}
          appearance="light"
        >
          <AlertTitle>{message.text}</AlertTitle>
        </Alert>
      ))}
    </div>
  );
}

function PasswordField({
  attrs,
  id,
}: {
  attrs: UiNodeInputAttributes;
  id: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={attrs.name}
        type={visible ? "text" : "password"}
        variant="lg"
        autoComplete={attrs.autocomplete}
        required={attrs.required}
        disabled={attrs.disabled}
        maxLength={attrs.maxlength}
        pattern={attrs.pattern}
        defaultValue={scalarValue(attrs.value)}
      />
      <button
        type="button"
        className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function CheckboxField({
  attrs,
  id,
  label,
}: {
  attrs: UiNodeInputAttributes;
  id: string;
  label: string;
}) {
  const initial =
    attrs.value === true || attrs.value === "true" || attrs.value === "1";
  const [checked, setChecked] = useState(initial);
  const submitted = scalarValue(attrs.value) || "true";
  return (
    <div className="flex items-center gap-2.5">
      {checked ? <input type="hidden" name={attrs.name} value={submitted} /> : null}
      <Checkbox
        id={id}
        checked={checked}
        disabled={attrs.disabled}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      {label ? <Label htmlFor={id}>{label}</Label> : null}
    </div>
  );
}

function InputNode({
  node,
  readOnlyNames,
}: {
  node: UiNode;
  readOnlyNames?: readonly string[];
}) {
  const attrs = node.attributes;
  if (attrs.node_type !== "input") {
    return null;
  }
  const id = attrs.name;
  const label = nodeLabel(node) || attrs.label?.text || "";
  const locked = Boolean(readOnlyNames?.includes(attrs.name));

  switch (attrs.type) {
    case "hidden":
      return (
        <input type="hidden" name={attrs.name} value={scalarValue(attrs.value)} />
      );
    case "submit":
      return (
        <Button
          type="submit"
          name={attrs.name}
          value={scalarValue(attrs.value)}
          variant={node.group === "oidc" || node.group === "saml" ? "outline" : "primary"}
          size="lg"
          className="w-full"
          disabled={attrs.disabled}
          onClick={() => callTrigger(attrs.onclickTrigger)}
        >
          {label || attrs.name}
        </Button>
      );
    case "button":
      return (
        <Button
          type="button"
          name={attrs.name}
          value={scalarValue(attrs.value)}
          variant="outline"
          size="lg"
          className="w-full"
          disabled={attrs.disabled}
          onClick={() => {
            if (attrs.onclick) {
              const button = document.getElementById(attrs.name);
              button?.setAttribute("onclick", attrs.onclick);
            }
            callTrigger(attrs.onclickTrigger);
          }}
        >
          {label || attrs.name}
        </Button>
      );
    case "checkbox":
      return <CheckboxField attrs={attrs} id={id} label={label} />;
    case "password":
      return (
        <Field label={label} id={id} messages={node.messages}>
          <PasswordField attrs={attrs} id={id} />
        </Field>
      );
    case "text":
    case "email":
    case "tel":
    case "url":
    case "number":
    case "date":
    case "datetime-local":
      return (
        <Field
          label={label}
          id={id}
          messages={node.messages}
          hint={fieldHint(attrs.name, locked)}
        >
          {attrs.options && attrs.options.length > 0 ? (
            <select
              id={id}
              name={attrs.name}
              required={attrs.required}
              disabled={attrs.disabled}
              defaultValue={scalarValue(attrs.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {attrs.options.map((option) => {
                const value = scalarValue(option.value);
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          ) : (
            <Input
              id={id}
              name={attrs.name}
              type={attrs.type}
              variant="lg"
              autoComplete={attrs.autocomplete}
              required={attrs.required}
              disabled={attrs.disabled}
              readOnly={locked}
              aria-readonly={locked || undefined}
              maxLength={attrs.maxlength}
              pattern={attrs.pattern}
              defaultValue={scalarValue(attrs.value)}
            />
          )}
        </Field>
      );
    case "11184809":
      return null;
    default: {
      const exhaustive: never = attrs;
      return exhaustive;
    }
  }
}

function Field({
  label,
  id,
  messages,
  hint,
  children,
}: {
  label: string;
  id: string;
  messages?: Array<UiText>;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      {children}
      {hint ? <p className="text-xs text-secondary-foreground">{hint}</p> : null}
      <Messages messages={messages} />
    </div>
  );
}

function OtherNode({
  node,
  readOnlyNames,
}: {
  node: UiNode;
  readOnlyNames?: readonly string[];
}) {
  const attrs = node.attributes;
  switch (attrs.node_type) {
    case "input":
      return <InputNode node={node} readOnlyNames={readOnlyNames} />;
    case "text":
      return <p className="text-sm text-secondary-foreground">{attrs.text.text}</p>;
    case "a":
      return (
        <a href={attrs.href} className="text-sm font-medium text-primary hover:underline">
          {attrs.title.text}
        </a>
      );
    case "img":
      return (
        <img
          src={attrs.src}
          alt=""
          width={attrs.width || undefined}
          height={attrs.height || undefined}
          id={attrs.id}
        />
      );
    case "script":
      return null;
    case "div":
      return <div id={attrs.id} className={attrs.class} />;
    default: {
      const exhaustive: never = attrs;
      return exhaustive;
    }
  }
}

function visible(node: UiNode): boolean {
  return !(
    node.attributes.node_type === "input" && node.attributes.type === "hidden"
  ) && node.attributes.node_type !== "script";
}

export function FlowForm({
  ui,
  readOnlyNames,
}: {
  ui: FlowUi;
  readOnlyNames?: readonly string[];
}) {
  useEffect(() => {
    const scripts = ui.nodes.filter(
      (node) => node.attributes.node_type === "script",
    );
    for (const node of scripts) {
      const attrs = node.attributes;
      if (attrs.node_type !== "script") {
        continue;
      }
      if (document.getElementById(attrs.id)) {
        continue;
      }
      const script = document.createElement("script");
      script.id = attrs.id;
      script.src = attrs.src;
      script.async = attrs.async;
      if (attrs.integrity) {
        script.integrity = attrs.integrity;
      }
      if (attrs.crossorigin) {
        script.crossOrigin = attrs.crossorigin;
      }
      if (attrs.nonce) {
        script.nonce = attrs.nonce;
      }
      if (attrs.type) {
        script.type = attrs.type;
      }
      if (attrs.referrerpolicy) {
        script.referrerPolicy = attrs.referrerpolicy as ReferrerPolicy;
      }
      document.body.appendChild(script);
    }

    for (const node of ui.nodes) {
      const attrs = node.attributes;
      if (attrs.node_type !== "input") {
        continue;
      }
      const el = document.getElementsByName(attrs.name)[0];
      if (attrs.onclick && el) {
        el.setAttribute("onclick", attrs.onclick);
      }
      if (attrs.onload && el) {
        el.setAttribute("onload", attrs.onload);
      }
      if (attrs.onloadTrigger) {
        callTrigger(attrs.onloadTrigger);
      }
    }
  }, [ui.nodes]);

  const groups: UiNodeGroupEnum[] = [];
  for (const node of ui.nodes) {
    if (!groups.includes(node.group)) {
      groups.push(node.group);
    }
  }
  groups.sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
  );

  return (
    <form action={ui.action} method={ui.method === "GET" ? "get" : "post"} className="flex flex-col gap-6">
      <Messages messages={ui.messages} />
      {groups.map((group) => {
        const nodes = ui.nodes.filter((node) => node.group === group);
        const title = groupTitle(group);
        const showTitle = Boolean(title) && nodes.some(visible);
        return (
          <div key={group} className="flex flex-col gap-4">
            {showTitle ? (
              <div className="flex flex-col gap-3">
                <Separator />
                <h2 className="text-sm font-semibold text-mono">{title}</h2>
              </div>
            ) : null}
            {nodes.map((node, index) => (
              <OtherNode
                key={`${group}-${node.attributes.node_type}-${index}`}
                node={node}
                readOnlyNames={readOnlyNames}
              />
            ))}
          </div>
        );
      })}
    </form>
  );
}
