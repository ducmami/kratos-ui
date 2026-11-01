import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { oauth2Api } from "@/lib/kratos/client";
import { csrfHeaderName } from "@/lib/kratos/csrf";
import { rethrowIfRedirect } from "@/lib/kratos/errors";
import { first, type Search } from "@/lib/kratos/query";
import { readSession } from "@/lib/kratos/session";

export const metadata = { title: "Đăng xuất" };

export default async function LogoutPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const challenge = first((await searchParams).logout_challenge);
  if (!challenge) {
    redirect("/login");
  }

  const session = await readSession();
  if (session.kind === "aal2") {
    redirect(session.redirectTo);
  }

  const oauth = oauth2Api();
  if (!oauth) {
    redirect("/login");
  }

  try {
    const { data: body } = await oauth.getOAuth2LogoutRequest({
      logoutChallenge: challenge,
    });
    if (body.client?.skip_logout_consent) {
      const accepted = await oauth.acceptOAuth2LogoutRequest({
        logoutChallenge: challenge,
      });
      redirect(accepted.data.redirect_to);
    }
  } catch (err) {
    rethrowIfRedirect(err);
    redirect("/login");
  }

  const token = (await headers()).get(csrfHeaderName()) || "";
  return (
    <form action="/logout" method="post" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-mono">Đăng xuất</h1>
        <p className="text-sm text-secondary-foreground">
          Ứng dụng yêu cầu kết thúc phiên. Bạn có muốn đăng xuất?
        </p>
      </div>
      <input type="hidden" name="_csrf" value={token} />
      <input type="hidden" name="challenge" value={challenge} />
      <div className="flex flex-col gap-2">
        <Button type="submit" name="submit" value="Yes" size="lg">
          Đăng xuất
        </Button>
        <Button
          type="submit"
          name="submit"
          value="No"
          variant="outline"
          size="lg"
        >
          Ở lại
        </Button>
      </div>
    </form>
  );
}
