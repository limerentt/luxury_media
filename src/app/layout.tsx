import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luxury Account - AI-Powered Media Generation",
  description: "Transform your business with AI-powered media generation. Create stunning visuals, videos, and content that captivates your luxury audience.",
  keywords: ["AI", "media generation", "luxury", "content creation", "artificial intelligence"],
  authors: [{ name: "Luxury Account Team" }],
  openGraph: {
    title: "Luxury Account - AI-Powered Media Generation",
    description: "Transform your business with AI-powered media generation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
} 