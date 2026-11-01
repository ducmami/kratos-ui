import {
  AcceptOAuth2ConsentRequestSession,
  OAuth2ConsentRequest,
} from "@ory/client";

export function oidcConformityMaybeFakeSession(
  grantScope: string[],
  session: AcceptOAuth2ConsentRequestSession,
): AcceptOAuth2ConsentRequestSession {
  if (process.env.CONFORMITY_FAKE_CLAIMS !== "1") {
    return session;
  }

  const idToken: Record<string, unknown> = {};

  if (grantScope.indexOf("email") > -1) {
    idToken.email = "foo@bar.com";
    idToken.email_verified = true;
  }
  if (grantScope.indexOf("phone") > -1) {
    idToken.phone_number = "1337133713371337";
    idToken.phone_number_verified = true;
  }
  if (grantScope.indexOf("profile") > -1) {
    idToken.name = "Foo Bar";
    idToken.given_name = "Foo";
    idToken.family_name = "Bar";
    idToken.website = "https://www.ory.sh";
    idToken.zoneinfo = "Europe/Belrin";
    idToken.birthdate = "1.1.2014";
    idToken.gender = "robot";
    idToken.profile = "https://www.ory.sh";
    idToken.preferred_username = "robot";
    idToken.middle_name = "Baz";
    idToken.locale = "en-US";
    idToken.picture =
      "https://raw.githubusercontent.com/ory/web/master/static/images/favico.png";
    idToken.updated_at = 1604416603;
    idToken.nickname = "foobot";
  }
  if (grantScope.indexOf("address") > -1) {
    idToken.address = {
      country: "Localhost",
      region: "Intranet",
      street_address: "Local Street 1337",
    };
  }

  return {
    access_token: session.access_token,
    id_token: {
      ...idToken,
      ...(session.id_token as Record<string, unknown> | undefined),
    },
  };
}

export function shouldSkipConsent(body: OAuth2ConsentRequest): boolean {
  const trusted = String(process.env.TRUSTED_CLIENT_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const clientId = body.client?.client_id;
  return Boolean(
    body.skip ||
      body.client?.skip_consent ||
      (clientId && trusted.indexOf(clientId) > -1),
  );
}
