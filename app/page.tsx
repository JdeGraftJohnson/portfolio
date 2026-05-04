"use client";

import { Hero } from "@/components/Hero";
import { ProjectsSection } from "@/components/ProjectsSection";

export default function Home() {
  return (
    <main style={{ background: "#05050f", minHeight: "100vh" }}>
      <Hero />
      <ProjectsSection />

      <footer
        className="py-10 px-6 text-center border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#05050f" }}
      >
        <p className="text-white/30 text-xs">
          John de Graft-Johnson · johndegraft.app
        </p>
      </footer>
    </main>
  );
}
