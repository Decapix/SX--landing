import type React from "react";
import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { LangProvider } from "@/context/lang-context";
import { BotDetectionProvider } from "@/components/security/bot-detection-provider";
import { Analytics } from "@vercel/analytics/next";
import "@decapix/sf-ui/styles/tokens.css";
import "@decapix/sf-ui/styles/base.css";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "samples.fashion",
  description:
    "The platform where fashion finds its samples — brands, press offices and stylists, together.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${urbanist.variable} font-body text-ink min-h-screen flex flex-col`}
      >
        <LangProvider>
          <BotDetectionProvider>{children}</BotDetectionProvider>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
