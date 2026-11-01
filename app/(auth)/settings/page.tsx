import type { Metadata } from "next";
import { AuthFlowPage } from "@/components/kratos/auth-flow-page";
import type { SearchParams } from "@/lib/kratos";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AuthFlowPage kind="settings" searchParams={searchParams} />;
}
