import type { Metadata } from "next";
import { AuthFlowPage } from "@/components/kratos/auth-flow-page";
import type { SearchParams } from "@/lib/kratos";

export const metadata: Metadata = { title: "Xác minh email" };

export default function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AuthFlowPage kind="verification" searchParams={searchParams} />;
}
