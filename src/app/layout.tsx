import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SEO_KEYWORDS } from "@/lib/constant";
// import { RootSidebar } from "@/ui-components/RootSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "UdyatAI: AI Career Guide & Resume Analyzer",
    template: `%s | UdyatAI`,
  },
  description:
    "Elevate your career with UdyatAI. Upload your resume for an in-depth AI analysis, discover skill gaps, get improvement suggestions, and generate tailored cover letters instantly. Your personal career strategy assistant.",
  keywords: SEO_KEYWORDS,
  applicationName: "UdyatAI",
  creator: "UdyatAI",
  publisher: "UdyatAI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
