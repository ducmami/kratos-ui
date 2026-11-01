"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-mono">Đã xảy ra lỗi</h1>
        <p className="text-sm text-secondary-foreground">
          Không tải được trang. Thử lại, hoặc quay về trang chủ.
        </p>
        <div className="flex gap-2">
          <Button type="button" onClick={() => reset()}>
            Thử lại
          </Button>
          <Button variant="outline" asChild>
            <Link href="/welcome">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
