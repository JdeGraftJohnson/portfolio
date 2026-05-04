import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "John de Graft-Johnson · AI/ML Engineer",
  description:
    "Building production AI systems for healthcare, government, and enterprise. Specialising in agentic pipelines, clinical ML, and responsible AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
