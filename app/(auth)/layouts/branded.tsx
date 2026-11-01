import type { ReactNode } from "react";
import Link from "next/link";
import { toAbsoluteUrl } from "@/lib/helpers";
import { Card, CardContent } from "@/components/ui/card";

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-full grow lg:grid-cols-2">
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl("/media/images/2600x1600/1.png")}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl("/media/images/2600x1600/1-dark.png")}');
          }
        `}
      </style>
      <div className="order-2 flex items-center justify-center overflow-y-auto p-8 lg:order-1 lg:p-10">
        <Card className="w-full max-w-[400px]">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>

      <div className="branded-bg order-1 bg-top bg-no-repeat xl:bg-cover xxl:bg-center lg:order-2 lg:m-5 lg:rounded-xl lg:border lg:border-border">
        <div className="flex flex-col gap-4 p-8 lg:p-16">
          <Link href="/">
            <img
              src={toAbsoluteUrl("/media/app/mini-logo.svg")}
              className="h-[28px] max-w-none"
              alt="Vietso"
            />
          </Link>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-mono">
              Đăng nhập an toàn
            </h2>
            <p className="text-base font-medium text-secondary-foreground">
              Cổng tài khoản Vietso để{" "}
              <span className="font-semibold text-mono">
                đăng nhập và quản lý
              </span>{" "}
              phiên làm việc của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
