"use client";

export function Hero() {
  return (
    <header
      className="relative overflow-hidden flex items-center justify-center text-white px-4 md:px-8 lg:px-16 py-3 md:py-4"
      style={{ background: "linear-gradient(to bottom right, #6b46c1, #312e81)" }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="space-y-2 text-center lg:text-left">
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
          <div className="flex gap-3 justify-center lg:justify-start pt-2">
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
    </header>
  );
}
