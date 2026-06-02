"use client";

import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";

export default function Home() {
  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Hero />
      <StatsBar />
      <ExperienceSection />
      <ProjectsSection />

      <footer id="contact" className="py-16 md:py-20 bg-white text-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Connect with John <span className="text-indigo-600">▲</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Open to clinical AI, governance, and agentic-pipeline roles in the UK health, biotech,
            and research sector.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="https://github.com/JdeGraftJohnson/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 bg-indigo-50 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition"
            >
              <h3 className="text-xl font-semibold mb-1 text-gray-900 group-hover:text-indigo-700">
                GitHub
              </h3>
              <p className="text-sm text-gray-600">Code and contributions</p>
            </a>
            <a
              href="https://www.linkedin.com/in/johndegraft"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 bg-purple-50 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition"
            >
              <h3 className="text-xl font-semibold mb-1 text-gray-900 group-hover:text-purple-700">
                LinkedIn
              </h3>
              <p className="text-sm text-gray-600">Connect professionally</p>
            </a>
            <a
              href="mailto:johndegraft2022@gmail.com"
              className="group block p-6 bg-blue-50 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition"
            >
              <h3 className="text-xl font-semibold mb-1 text-gray-900 group-hover:text-blue-700">
                Email
              </h3>
              <p className="text-sm text-gray-600">Direct message</p>
            </a>
          </div>

          <p className="mt-14 text-gray-500 text-xs">
            &copy; 2026 John de Graft-Johnson · johndegraft.app
          </p>
        </div>
      </footer>
    </main>
  );
}
