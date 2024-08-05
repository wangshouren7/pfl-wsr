import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Npcs - Large file upload",
  description: "Large file upload",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} flex h-screen flex-col items-center justify-center gap-6 p-4`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
