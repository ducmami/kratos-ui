import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BrandedLayout } from "@/app/(auth)/layouts/branded";

export default function NotFound() {
  return (
    <BrandedLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-mono">Không tìm thấy trang</h1>
        <p className="text-sm text-secondary-foreground">
          Đường dẫn này không có trên cổng tài khoản.
        </p>
        <Button asChild>
          <Link href="/welcome">Về trang chủ</Link>
        </Button>
      </div>
    </BrandedLayout>
  );
}
