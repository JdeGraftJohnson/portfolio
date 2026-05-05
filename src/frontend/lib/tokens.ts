export const tokens = {
  bg: "#05050f",
  surface: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
  accent: "#60a5fa",
  accentAlt: "#14b8a6",
  text: "#f1f5f9",
  muted: "rgba(255,255,255,0.5)",
  riskLow: "#22c55e",
  riskMid: "#f59e0b",
  riskHigh: "#ef4444",
} as const;

export function riskColor(pct: number): string {
  const clamp = Math.max(0, Math.min(100, pct));
  if (clamp <= 50) {
    const t = clamp / 50;
    return blend([34, 197, 94], [245, 158, 11], t);  // green → orange
  }
  const t = (clamp - 50) / 50;
  return blend([245, 158, 11], [239, 68, 68], t);
}

function blend(a: number[], b: number[], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
