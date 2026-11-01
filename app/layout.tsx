import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/css/styles.css";

export const metadata = {
  title: {
    template: "%s | Vietso",
    default: "Vietso",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" lang="vi">
      <body
        className={cn(
          "flex h-full min-h-full flex-col bg-background text-base text-foreground antialiased",
        )}
      >
        {children}
      </body>
    </html>
  );
}
