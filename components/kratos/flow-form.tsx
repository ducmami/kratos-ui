import type { ReactNode } from "react";
import type { UiNode, UiNodeInputAttributes, UiText } from "@ory/client";
import { Alert, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/kratos/password-field";
import {
  alertVariant,
  fieldId,
  groupHeading,
  groupNodes,
  hasVisibleNode,
  inputValue,
  isUiNodeAnchorAttributes,
  isUiNodeDivisionAttributes,
  isUiNodeImageAttributes,
  isUiNodeInputAttributes,
  isUiNodeScriptAttributes,
  isUiNodeTextAttributes,
  messageClass,
  nodeLabel,
} from "@/lib/ui-nodes";

type FlowFormProps = {
  title: string;
  action: string;
  method: string;
  nodes: UiNode[];
  messages?: UiText[];
  footer?: ReactNode;
};

function NodeMessages({ messages }: { messages: UiText[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-1">
      {messages.map((message, index) => (
        <li
          key={`${message.id}-${index}`}
          className={messageClass(message.type)}
        >
          {message.text}
        </li>
      ))}
    </ul>
  );
}

function FlowMessages({ messages }: { messages: UiText[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <Alert
          key={`${message.id}-${index}`}
          variant={alertVariant(message.type)}
          appearance="light"
          size="sm"
          close={false}
        >
          <AlertIcon />
          <AlertTitle>{message.text}</AlertTitle>
        </Alert>
      ))}
    </div>
  );
}

function InputControl({
  node,
  attributes,
}: {
  node: UiNode;
  attributes: UiNodeInputAttributes;
}) {
  const id = attributes.name ? fieldId(attributes.name) : undefined;
  const label = nodeLabel(node);
  const value = inputValue(attributes.value);

  switch (attributes.type) {
    case "hidden":
      return <input type="hidden" name={attributes.name} defaultValue={value} />;
    case "submit":
      return (
        <div className="space-y-1.5">
          <Button
            type="submit"
            name={attributes.name}
            value={value}
            disabled={attributes.disabled}
            size="lg"
            className="w-full"
          >
            {label || value}
          </Button>
          <NodeMessages messages={node.messages} />
        </div>
      );
    case "button":
      return (
        <div className="space-y-1.5">
          <Button
            type="button"
            name={attributes.name}
            value={value}
            disabled={attributes.disabled}
            variant="outline"
            size="lg"
            className="w-full"
          >
            {label || value}
          </Button>
          <NodeMessages messages={node.messages} />
        </div>
      );
    case "checkbox":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="checkbox"
              name={attributes.name}
              value={value || "true"}
              defaultChecked={attributes.value === true || value === "true"}
              disabled={attributes.disabled}
              required={attributes.required}
              className="size-5 shrink-0 rounded-md border border-input accent-primary"
            />
            {label ? <Label htmlFor={id}>{label}</Label> : null}
          </div>
          <NodeMessages messages={node.messages} />
        </div>
      );
    case "password":
      return (
        <Field label={label} id={id} messages={node.messages}>
          <PasswordField
            id={id ?? attributes.name}
            name={attributes.name}
            defaultValue={value}
            autoComplete={attributes.autocomplete}
            required={attributes.required}
            disabled={attributes.disabled}
          />
        </Field>
      );
    case "text":
    case "email":
    case "number":
    case "tel":
    case "url":
    case "date":
    case "datetime-local":
      return (
        <Field label={label} id={id} messages={node.messages}>
          <Input
            id={id}
            name={attributes.name}
            type={attributes.type}
            variant="lg"
            defaultValue={value}
            autoComplete={attributes.autocomplete}
            required={attributes.required}
            disabled={attributes.disabled}
            pattern={attributes.pattern}
          />
        </Field>
      );
    case "11184809":
      return null;
    default: {
      const exhaustive: never = attributes.type;
      return exhaustive;
    }
  }
}

function Field({
  label,
  id,
  messages,
  children,
}: {
  label: string;
  id?: string;
  messages: UiText[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      {children}
      <NodeMessages messages={messages} />
    </div>
  );
}

function NodeView({ node }: { node: UiNode }) {
  const attributes = node.attributes;

  if (isUiNodeInputAttributes(attributes)) {
    return <InputControl node={node} attributes={attributes} />;
  }

  if (isUiNodeTextAttributes(attributes)) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-foreground">{attributes.text.text}</p>
        <NodeMessages messages={node.messages} />
      </div>
    );
  }

  if (isUiNodeAnchorAttributes(attributes)) {
    return (
      <div className="space-y-1">
        <a href={attributes.href} className="text-sm font-medium text-primary">
          {attributes.title.text}
        </a>
        <NodeMessages messages={node.messages} />
      </div>
    );
  }

  if (isUiNodeImageAttributes(attributes)) {
    return (
      // Kratos gửi src của node ảnh (QR TOTP). Không đi qua next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attributes.src}
        alt={node.meta.label?.text ?? ""}
        width={attributes.width}
        height={attributes.height}
        className="max-w-full"
      />
    );
  }

  if (isUiNodeDivisionAttributes(attributes) || isUiNodeScriptAttributes(attributes)) {
    return null;
  }

  const exhaustive: never = attributes;
  return exhaustive;
}

function isSubmitNode(node: UiNode): boolean {
  return (
    isUiNodeInputAttributes(node.attributes) && node.attributes.type === "submit"
  );
}

function GroupFields({
  group,
  groupIndex,
  showHeading,
}: {
  group: ReturnType<typeof groupNodes>[number];
  groupIndex: number;
  showHeading: boolean;
}) {
  const heading =
    showHeading && hasVisibleNode(group.nodes) ? groupHeading(group.group) : null;
  return (
    <div className="space-y-4">
      {heading ? (
        <h2 className="text-sm font-medium text-foreground">{heading}</h2>
      ) : null}
      {group.nodes.map((node, index) => (
        <NodeView key={`${group.group}-${groupIndex}-${index}`} node={node} />
      ))}
    </div>
  );
}

export function FlowForm({
  title,
  action,
  method,
  nodes,
  messages = [],
  footer,
}: FlowFormProps) {
  const formMethod = method.toLowerCase() === "get" ? "get" : "post";
  const groups = groupNodes(nodes);
  const showHeadings =
    groups.filter(
      (group) => hasVisibleNode(group.nodes) && groupHeading(group.group),
    ).length > 1;
  const actionGroups = groups.filter((group) => group.nodes.some(isSubmitNode));
  const sharedNodes = groups
    .filter((group) => !group.nodes.some(isSubmitNode))
    .flatMap((group) => group.nodes);
  const heading = (
    <div className="space-y-1.5 pb-1">
      <h1 className="text-center text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );

  // Settings gửi nhiều method (hồ sơ, mật khẩu). Chung một form thì ô
  // password required chặn nút Lưu của hồ sơ, và form Đăng xuất bị lồng bên trong.
  if (actionGroups.length > 1) {
    return (
      <div className="block w-full space-y-5">
        {heading}
        <FlowMessages messages={messages} />
        {actionGroups.map((group, groupIndex) => (
          <form
            key={`${group.group}-${groupIndex}`}
            action={action}
            method={formMethod}
            className="space-y-4"
          >
            {sharedNodes.map((node, index) => (
              <NodeView key={`shared-${group.group}-${index}`} node={node} />
            ))}
            <GroupFields
              group={group}
              groupIndex={groupIndex}
              showHeading={showHeadings}
            />
          </form>
        ))}
        {footer}
      </div>
    );
  }

  return (
    <form action={action} method={formMethod} className="block w-full space-y-5">
      {heading}
      <FlowMessages messages={messages} />
      {groups.map((group, groupIndex) => (
        <GroupFields
          key={`${group.group}-${groupIndex}`}
          group={group}
          groupIndex={groupIndex}
          showHeading={showHeadings}
        />
      ))}
      {footer}
    </form>
  );
}
