import type { Metadata } from "next";
import { AuthFlowPage } from "@/components/kratos/auth-flow-page";
import type { SearchParams } from "@/lib/kratos";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AuthFlowPage kind="registration" searchParams={searchParams} />;
}
