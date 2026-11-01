import { ReactNode } from "react";

import { BrandedLayout } from "./layouts/branded";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <BrandedLayout>{children}</BrandedLayout>;
}
