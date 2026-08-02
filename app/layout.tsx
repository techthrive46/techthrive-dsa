import type { Metadata } from "next";
import { Archivo, Caveat, JetBrains_Mono } from "next/font/google";
import { SiteNav, SiteFooter } from "@/components/site-chrome";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoThrive — Visual Data Structures & Algorithms for Students",
  description:
    "Learn DSA by watching it move. Play, pause and step through sorting, searching, trees and graphs on animated graph paper.",
  openGraph: {
    title: "AlgoThrive — Visual Data Structures & Algorithms for Students",
    description:
      "Learn DSA by watching it move. Play, pause and step through sorting, searching, trees and graphs on animated graph paper.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${caveat.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="paper flex min-h-full flex-col font-sans text-foreground">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
