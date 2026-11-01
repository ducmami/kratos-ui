import { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { toAbsoluteUrl } from "@/lib/helpers";

export function BrandedLayout({ children }: { children: ReactNode }) {
  return (
    <>
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
      <div className="grid grow lg:grid-cols-2">
        <div className="order-2 flex items-center justify-center p-8 lg:order-1 lg:p-10">
          <Card className="w-full max-w-[440px]">
            <CardContent className="p-6">{children}</CardContent>
          </Card>
        </div>
        <div className="branded-bg order-1 bg-top bg-no-repeat lg:order-2 lg:m-5 lg:rounded-xl lg:border lg:border-border lg:bg-cover">
          <div className="flex flex-col gap-4 p-8 lg:p-16">
            <Link href="/welcome">
              <img
                src={toAbsoluteUrl("/media/app/mini-logo.svg")}
                className="h-[28px] max-w-none"
                alt="Viết Sớ"
              />
            </Link>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-semibold text-mono">
                Cổng tài khoản Viết Sớ
              </h2>
              <p className="text-base font-medium text-secondary-foreground">
                Đăng nhập, đăng ký và quản lý tài khoản ở một nơi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
