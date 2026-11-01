import Link from "next/link";
import type { FlowError } from "@ory/client";
import { buttonVariants } from "@/components/ui/button";
import { firstQuery, kratosFrontend, type SearchParams } from "@/lib/kratos";
import { cn } from "@/lib/utils";

export const metadata = { title: "Đã có lỗi" };

function errorText(error: FlowError): string {
  const detail = error.error;
  if (detail && typeof detail === "object") {
    if ("message" in detail && typeof detail.message === "string" && detail.message) {
      return detail.message;
    }
    if ("reason" in detail && typeof detail.reason === "string" && detail.reason) {
      return detail.reason;
    }
  }
  return "Không đọc được chi tiết lỗi.";
}

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const id = firstQuery(query.id);
  let message = "Không tìm thấy mã lỗi.";

  if (id) {
    try {
      const { data } = await kratosFrontend().getFlowError({ id });
      message = errorText(data);
    } catch {
      message = "Không đọc được chi tiết lỗi.";
    }
  }

  return (
    <div className="space-y-5 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Đã có lỗi</h1>
      <p className="text-sm text-foreground">{message}</p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        Về trang chủ
      </Link>
    </div>
  );
}
