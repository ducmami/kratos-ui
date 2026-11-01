import type { ReactNode } from "react";
import type {
  UiNode,
  UiNodeAttributes,
  UiNodeGroupEnum,
  UiTextTypeEnum,
} from "@ory/client";

export function isUiNodeInputAttributes(
  attrs: UiNodeAttributes,
): attrs is Extract<UiNodeAttributes, { node_type: "input" }> {
  return attrs.node_type === "input";
}

export function isUiNodeTextAttributes(
  attrs: UiNodeAttributes,
): attrs is Extract<UiNodeAttributes, { node_type: "text" }> {
  return attrs.node_type === "text";
}

export function isUiNodeAnchorAttributes(
  attrs: UiNodeAttributes,
): attrs is Extract<UiNodeAttributes, { node_type: "a" }> {
  return attrs.node_type === "a";
}

export function isUiNodeImageAttributes(
  attrs: UiNodeAttributes,
): attrs is Extract<UiNodeAttributes, { node_type: "img" }> {
  return attrs.node_type === "img";
}

export function isUiNodeScriptAttributes(
  attrs: UiNodeAttributes,
): attrs is Extract<UiNodeAttributes, { node_type: "script" }> {
  return attrs.node_type === "script";
}

export function isUiNodeDivisionAttributes(
  attrs: UiNodeAttributes,
): attrs is Extract<UiNodeAttributes, { node_type: "div" }> {
  return attrs.node_type === "div";
}

export function nodeLabel(node: UiNode): string {
  const attributes = node.attributes;
  if (isUiNodeAnchorAttributes(attributes)) {
    return attributes.title.text;
  }
  if (isUiNodeTextAttributes(attributes)) {
    return attributes.text.text;
  }
  if (isUiNodeInputAttributes(attributes) && attributes.label?.text) {
    return attributes.label.text;
  }
  return node.meta.label?.text ?? "";
}

export function inputValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

export function groupHeading(group: UiNodeGroupEnum): string | null {
  switch (group) {
    case "default":
    case "link":
      return null;
    case "password":
      return "Mật khẩu";
    case "profile":
      return "Hồ sơ";
    case "oidc":
      return "Liên kết";
    case "code":
      return "Mã";
    case "totp":
      return "Ứng dụng xác thực";
    case "lookup_secret":
      return "Mã dự phòng";
    case "webauthn":
      return "Khóa bảo mật";
    case "passkey":
      return "Passkey";
    case "saml":
      return "Liên kết";
    case "identifier_first":
    case "captcha":
    case "deviceauthn":
    case "oauth2_consent":
    case "11184809":
      return null;
    default: {
      const exhaustive: never = group;
      return exhaustive;
    }
  }
}

export type NodeGroup = {
  group: UiNodeGroupEnum;
  nodes: UiNode[];
};

export function groupNodes(nodes: UiNode[]): NodeGroup[] {
  const groups: NodeGroup[] = [];
  for (const node of nodes) {
    if (isUiNodeScriptAttributes(node.attributes)) {
      continue;
    }
    const last = groups[groups.length - 1];
    if (!last || last.group !== node.group) {
      groups.push({ group: node.group, nodes: [node] });
    } else {
      last.nodes.push(node);
    }
  }
  return groups;
}

export function isHiddenInput(node: UiNode): boolean {
  return (
    isUiNodeInputAttributes(node.attributes) &&
    node.attributes.type === "hidden"
  );
}

export function hasVisibleNode(nodes: UiNode[]): boolean {
  return nodes.some((node) => !isHiddenInput(node));
}

export function messageClass(type: UiTextTypeEnum): string {
  switch (type) {
    case "error":
      return "text-xs text-destructive";
    case "success":
      return "text-xs text-green-600";
    case "info":
    case "11184809":
      return "text-xs text-muted-foreground";
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}

export function alertVariant(
  type: UiTextTypeEnum,
): "info" | "destructive" | "success" {
  switch (type) {
    case "error":
      return "destructive";
    case "success":
      return "success";
    case "info":
    case "11184809":
      return "info";
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}

export function fieldId(name: string): string {
  return `kratos-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export type { ReactNode };
