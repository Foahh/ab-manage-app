import type { Metadata } from "next";
import "./globals.css";
import type React from "react";
import ReactQueryProvider from "@/components/provider/react-query-provider";
import ThemeProvider from "@/components/provider/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "无名战管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <title>{metadata.title?.toString()}</title>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <main>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
