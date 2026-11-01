import { NextResponse } from "next/server";

type SameSite = "lax" | "strict" | "none";

function isSameSite(value: string): value is SameSite {
  return value === "lax" || value === "strict" || value === "none";
}

export function readSetCookie(headers: unknown): string[] {
  if (!headers || typeof headers !== "object") {
    return [];
  }
  const bag = headers as {
    getSetCookie?: () => string[];
    "set-cookie"?: string | string[];
  };
  if (typeof bag.getSetCookie === "function") {
    const list = bag.getSetCookie();
    if (list.length > 0) {
      return list;
    }
  }
  const raw = bag["set-cookie"];
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : [raw];
}

export function appendSetCookies(
  response: NextResponse,
  setCookie: string[],
): void {
  for (const raw of setCookie) {
    const parts = raw.split(";").map((part) => part.trim());
    const pair = parts[0];
    if (!pair) {
      continue;
    }
    const eq = pair.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const name = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    const options: {
      path?: string;
      maxAge?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: SameSite;
      expires?: Date;
    } = {};
    for (const attr of parts.slice(1)) {
      const splitAt = attr.indexOf("=");
      const key = (splitAt === -1 ? attr : attr.slice(0, splitAt)).toLowerCase();
      const attrValue = splitAt === -1 ? "" : attr.slice(splitAt + 1);
      if (key === "path" && attrValue) {
        options.path = attrValue;
      } else if (key === "max-age" && attrValue) {
        options.maxAge = Number(attrValue);
      } else if (key === "httponly") {
        options.httpOnly = true;
      } else if (key === "secure") {
        options.secure = true;
      } else if (key === "samesite" && isSameSite(attrValue.toLowerCase())) {
        options.sameSite = attrValue.toLowerCase() as SameSite;
      } else if (key === "expires" && attrValue) {
        options.expires = new Date(attrValue);
      }
    }
    response.cookies.set(name, value, options);
  }
}
