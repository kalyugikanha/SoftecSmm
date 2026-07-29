import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMEAI — Softecai Social Media AI Manager",
  description:
    "AI-powered social media management platform by Softecai. Automate content creation, approval workflows, and multi-platform posting.",
  keywords: "social media management, AI content, automation, Softecai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080808" />
      </head>
      <body>{children}</body>
    </html>
  );
}
