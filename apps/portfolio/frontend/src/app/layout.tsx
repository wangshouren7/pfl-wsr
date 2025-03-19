import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Fireflies } from "@/libs/ui/fireflies";
import { Audio } from "@/domains/audio";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `Portfolio of Shouren Wang | Next.js Portfolio Created with Three.js and Tailwind CSS`,
  description:
    "A unique creative portfolio with cutting-edge technologies like Next.js, Tailwind CSS, Three.js, and Framer Motion. Experience the art of modern web development firsthand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        {children}
        <Audio className="fixed top-4 right-4" />
        <Fireflies />
      </body>
    </html>
  );
}
