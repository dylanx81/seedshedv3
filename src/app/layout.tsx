import type { Metadata } from "next";

import "./globals.css";
import { TrpcProvider } from "@/components/TrpcProvider";

export const metadata: Metadata = {
  title: "Garden App",
  description: "Digital Potting Shed - Track your garden plants",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
        `}</style>
      </head>
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
