import type { ReactNode } from "react";
import { BrandedLayout } from "./layouts/branded";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <BrandedLayout>{children}</BrandedLayout>;
}
