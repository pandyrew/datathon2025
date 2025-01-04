import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Datathon 2025",
  description: "Datathon 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <SpeedInsights />
      <html lang="en">
        <body className={`antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
