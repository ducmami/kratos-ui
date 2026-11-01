import type { Metadata } from "next";
import { AuthFlowPage } from "@/components/kratos/auth-flow-page";
import type { SearchParams } from "@/lib/kratos";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function RecoveryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AuthFlowPage kind="recovery" searchParams={searchParams} />;
}
