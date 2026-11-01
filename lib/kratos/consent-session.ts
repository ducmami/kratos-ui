import { AcceptOAuth2ConsentRequestSession, Session } from "@ory/client";

function parseTraitList(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function copyTraitsInto(
  target: Record<string, unknown>,
  traits: Record<string, unknown> | undefined,
  names: string[],
): void {
  if (!traits) {
    return;
  }
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(traits, name)) {
      target[name] = traits[name];
    }
  }
}

export function extractSession(
  session: Session | undefined,
  grantScope: string[],
): AcceptOAuth2ConsentRequestSession {
  const tokenSession: AcceptOAuth2ConsentRequestSession = {
    access_token: {},
    id_token: {},
  };
  const identity = session?.identity;
  if (!identity) {
    return tokenSession;
  }

  const idToken = tokenSession.id_token as Record<string, unknown>;
  const traits = (identity.traits ?? {}) as Record<string, unknown>;

  if (grantScope.includes("email")) {
    const addresses = identity.verifiable_addresses || [];
    if (addresses.length > 0) {
      const address = addresses[0];
      if (address.via === "email") {
        idToken.email = address.value;
        idToken.email_verified = address.verified;
      }
    }
  }

  if (grantScope.includes("profile")) {
    if (typeof traits.username === "string") {
      idToken.preferred_username = traits.username;
    }
    if (typeof traits.website === "string") {
      idToken.website = traits.website;
    }
    if (typeof traits.name === "object" && traits.name) {
      const name = traits.name as { first?: string; last?: string };
      if (name.first) {
        idToken.given_name = name.first;
      }
      if (name.last) {
        idToken.family_name = name.last;
      }
    } else if (typeof traits.name === "string") {
      idToken.name = traits.name;
    }
    if (identity.updated_at) {
      idToken.updated_at = parseInt(
        (Date.parse(identity.updated_at) / 1000).toFixed(0),
        10,
      );
    }
  }

  copyTraitsInto(
    idToken,
    traits,
    parseTraitList(process.env.SESSION_EXTRA_TRAITS_ID_TOKEN),
  );
  copyTraitsInto(
    tokenSession.access_token as Record<string, unknown>,
    traits,
    parseTraitList(process.env.SESSION_EXTRA_TRAITS_ACCESS_TOKEN),
  );

  return tokenSession;
}

export function rememberForSeconds(): number {
  const raw = process.env.REMEMBER_CONSENT_SESSION_FOR_SECONDS;
  return raw ? Number(raw) : 3600;
}
