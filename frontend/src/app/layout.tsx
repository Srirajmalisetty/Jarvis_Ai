import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JARVIS AI | Autonomous Personal Operating System",
  description: "An advanced, autonomous AI personal operating system connecting to the Google Workspace ecosystem, featuring a glassmorphic Iron Man-inspired dashboard.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-[#030303] text-[#f5f5f7] antialiased select-none">
        {children}
      </body>
    </html>
  );
}

