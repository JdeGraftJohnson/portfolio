"use client";

const STATS = [
  { value: "6", label: "Production Projects", glyph: "▲", glyphColor: "#a78bfa" },
  { value: "10K+", label: "CPRD Patients Modelled", glyph: "●", glyphColor: "#818cf8" },
  { value: "7", label: "Governance Frameworks Applied", glyph: "⬢", glyphColor: "#f472b6" },
];

export function StatsBar() {
  return (
    <section className="py-16 md:py-20" style={{ background: "linear-gradient(to right, #eef2ff, #faf5ff)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-gray-900">
          Impact at a Glance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="p-6 bg-white rounded-2xl transform hover:scale-105 transition"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.05)" }}
            >
              <p
                className="text-4xl md:text-5xl font-extrabold mb-2"
                style={{
                  backgroundImage: "linear-gradient(to right, #6b46c1, #312e81)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </p>
              <p className="text-sm md:text-base font-medium text-gray-700">
                {s.label} <span style={{ color: s.glyphColor }}>{s.glyph}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
