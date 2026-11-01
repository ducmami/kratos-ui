import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider";

import "@/css/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | Viết Sớ",
    default: "Viết Sớ",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased flex h-full text-base text-foreground bg-background",
          inter.className,
        )}
      >
        <ThemeProvider>
          <div className="flex w-full flex-col">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
