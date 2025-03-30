import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootSidebar } from "@/ui-components/RootSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Resume Builder",
  description: "Create professional resumes using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootSidebar>{children}</RootSidebar>
      </body>
    </html>
  );
}
