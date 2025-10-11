import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Martin++ AI Assistant",
  description: "Your intelligent personal AI assistant powered by GPT-4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

