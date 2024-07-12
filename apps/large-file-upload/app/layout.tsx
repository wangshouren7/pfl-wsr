import { GitLog } from "@/shared/components/git-log";
import { cn } from "@/shared/utils";
import "@/socket/start-socket-server";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Large file upload",
  description: "Large file upload",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "flex h-screen flex-col gap-6 p-4")}>
        {children}
        <GitLog />
      </body>
    </html>
  );
}
