"use client";

const ROLES = [
  { glyph: "▲", label: "Healthcare AI" },
  { glyph: "◆", label: "Governance" },
  { glyph: "✦", label: "Agentic Pipelines" },
];

export function Hero() {
  return (
    <header
      className="relative overflow-hidden flex items-center justify-center text-white px-4 md:px-8 lg:px-16 py-4 md:py-5"
      style={{ background: "linear-gradient(to bottom right, #6b46c1, #312e81)" }}
    >
      {/* Decorative pulse rings (right side) */}
      <div className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-96 h-96">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-72 h-72 bg-white/10 rounded-full"
              style={{ animation: "pulseSlow 6s infinite ease-in-out" }}
            />
            <div
              className="absolute w-52 h-52 bg-white/10 rounded-full"
              style={{ animation: "pulseSlow 6s infinite ease-in-out", animationDelay: "0.2s" }}
            />
            <div
              className="absolute w-32 h-32 bg-white/10 rounded-full"
              style={{ animation: "pulseSlow 6s infinite ease-in-out", animationDelay: "0.4s" }}
            />
          </div>
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-xs p-6 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl rotate-3"
            style={{ transition: "transform .5s ease" }}
          >
            <p className="font-semibold text-2xl text-center leading-snug">
              NHS Clinical AI <span className="opacity-80">▲</span>{" "}
              Governance <span className="opacity-80">◆</span>{" "}
              Agentic Pipelines
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full max-w-7xl mx-auto">
        <div className="space-y-4 text-center lg:text-left">
          <h1
            className="font-extrabold tracking-tight leading-[1.05]"
            style={{ fontSize: "clamp(1.34rem, 3.35vw, 2.51rem)" }}
          >
            John de Graft-Johnson
          </h1>
          <p
            className="font-light tracking-wide opacity-90"
            style={{ fontSize: "clamp(0.754rem, 1.34vw, 1.005rem)" }}
          >
            AI/ML Engineer SME
          </p>
          <p className="text-[0.67rem] md:text-[0.754rem] opacity-80 max-w-xl mx-auto lg:mx-0">
            Production AI for NHS clinical decision support, AI governance, and agentic
            document pipelines — six shipped projects.
          </p>
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
            {ROLES.map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-white/10 border border-white/20"
              >
                <span aria-hidden>{r.glyph}</span>
                {r.label}
              </span>
            ))}
          </div>
          <div className="flex gap-3 justify-center lg:justify-start pt-3">
            <a
              href="#projects"
              className="inline-flex items-center px-5 py-2.5 bg-white text-indigo-800 font-bold text-sm rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition"
            >
              Explore Projects ❯
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-5 py-2.5 border-2 border-white text-white font-bold text-sm rounded-full hover:bg-white hover:text-indigo-800 transition"
            >
              Get In Touch ▲
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseSlow {
          0% {
            transform: scale(0.9);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.1;
          }
        }
      `}</style>
    </header>
  );
}
