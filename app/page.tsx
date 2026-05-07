"use client";

import { Hero } from "@/components/Hero";
import { ProjectsSection } from "@/components/ProjectsSection";

export default function Home() {
  return (
    <main style={{ background: "#05050f", minHeight: "100vh" }}>
      <Hero />
      <ProjectsSection />

      <footer
        className="py-10 px-6 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#05050f" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            John de Graft-Johnson · johndegraft.app
          </p>
          <div className="flex items-center gap-5 text-xs">
            <a
              href="https://github.com/JdeGraftJohnson"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/johndegraft"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:johndegraft2022@gmail.com"
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
