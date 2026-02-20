import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/lib/language-context"
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NorthWay Omni",
  description: "Omnichannel Messaging Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
