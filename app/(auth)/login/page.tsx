import type { Metadata } from "next";
import { AuthFlowPage } from "@/components/kratos/auth-flow-page";
import type { SearchParams } from "@/lib/kratos";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AuthFlowPage kind="login" searchParams={searchParams} />;
}
