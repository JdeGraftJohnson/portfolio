"use client";

import dynamic from "next/dynamic";
import { LiquidGlassCard } from "./LiquidGlassCard";

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), { ssr: false });
const ParticleNetwork = dynamic(
  () => import("./ParticleNetwork").then((m) => m.ParticleNetwork),
  { ssr: false },
);

const ROLES = [
  "AI/ML Engineer",
  "Agentic Pipeline Architect",
  "Clinical AI · Gov AI",
];

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden" style={{ background: "#05050f" }}>
      {/* 3D canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
          <ParticleNetwork />
        </Canvas>
      </div>

      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(5,5,15,0) 35%, rgba(5,5,15,0.80) 100%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6">
        <span className="text-white font-semibold tracking-tight text-sm">
          johndegraft.app
        </span>
        <a
          href="#projects"
          className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/60 hover:text-white/90 hover:border-white/40 transition-colors"
        >
          Projects ↓
        </a>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 -mt-16">
        <LiquidGlassCard
          interactive={false}
          radius={24}
          padding={48}
          className="max-w-2xl w-full text-center"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-blue-400 mb-4">
            {ROLES.join(" · ")}
          </p>
          <h1
            className="text-white font-semibold"
            style={{ fontSize: "clamp(1.75rem,4vw,3rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            John de Graft-Johnson
            <br />
            <span style={{ color: "#60a5fa" }}>Building AI that works</span>
          </h1>
          <p className="mt-5 text-white/70 text-base leading-relaxed max-w-xl mx-auto">
            Production AI systems for healthcare, government, and enterprise. From clinical
            risk models on NHS data standards to agentic document pipelines — built with
            governance, fairness, and deployment in mind.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#projects"
              className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-400 transition-colors"
            >
              View projects ↓
            </a>
            <a
              href="https://github.com/JdeGraftJohnson"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg border border-white/20 text-white/80 font-medium text-sm hover:bg-white/10 transition-colors"
            >
              GitHub →
            </a>
          </div>
        </LiquidGlassCard>

        {/* Accent legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Healthcare AI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
            Gov / Proposal AI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
            Responsible AI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Agentic Pipelines
          </span>
        </div>
      </div>
    </section>
  );
}
