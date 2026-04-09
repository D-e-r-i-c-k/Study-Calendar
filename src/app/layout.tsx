import type { Metadata } from "next";
import { Fraunces, Source_Serif_4, Libre_Franklin } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Study Planner",
  description:
    "An intelligent study calendar that generates optimized schedules using spaced repetition, active recall, and interleaving.",
};

import Masthead from "@/components/layout/Masthead";
import EdNav from "@/components/layout/EdNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSerif.variable} ${libreFranklin.variable}`}
    >
      <body className="min-h-screen">
        <Masthead />
        <EdNav />
        {children}
      </body>
    </html>
  );
}
