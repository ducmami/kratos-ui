import { redirect } from "next/navigation";
import { cookieHeader, kratosFrontend } from "@/lib/kratos";

// GET bị Next.js prefetch khi link nằm trong viewport, và prefetch đó
// đi tới logout_url của Kratos nên phiên vừa tạo bị thu hồi.
export async function POST() {
  const cookie = await cookieHeader();
  let logoutUrl = "/login";

  try {
    const { data } = await kratosFrontend().createBrowserLogoutFlow({ cookie });
    if (data.logout_url) {
      logoutUrl = data.logout_url;
    }
  } catch {
    logoutUrl = "/login";
  }

  redirect(logoutUrl);
}
