export interface TopDrug {
  ndc11: string;
  product_name: string;
  rx_count: number;
  spend: number;
  drug_class: string;
}

export interface StateRow {
  state_code: string;
  state_name: string;
  region: string;
  division: string;
  rx_count: number;
  total_reimb: number;
  top_class: string;
  top_class_share: number;
  top_drugs: TopDrug[];
}

export interface DataDoc {
  year: number;
  source: string;
  source_url: string;
  states: StateRow[];
  _meta: { states_count: number; total_rx_count: number; total_reimb: number };
}

// Categorical palette for drug classes (color-blind friendly Tableau 10)
export const CLASS_COLORS: Record<string, string> = {
  "Autoimmune / Biologic":         "#4e79a7",
  "Diabetes (GLP-1 / SGLT2)":      "#f28e2b",
  "Diabetes (Insulin / Other)":    "#e15759",
  "HIV / Antiretroviral":          "#76b7b2",
  "Mental Health":                 "#59a14f",
  "Cystic Fibrosis":               "#edc948",
  "Oncology":                      "#b07aa1",
  "Anticoagulant":                 "#ff9da7",
  "Cardiovascular":                "#9c755f",
  "Respiratory / Asthma":          "#bab0ac",
  "ADHD / Stimulant":              "#7c7c7c",
  "Hepatitis / Liver":             "#a3acff",
  "Corticosteroid / Anti-Inflammatory": "#d4a017",
  "Pain / Opioid":                 "#8c564b",
  "Hormonal / Reproductive":       "#e377c2",
  "Other / Unknown":               "#3a3a4a",
};

export function classColor(c: string): string {
  return CLASS_COLORS[c] ?? CLASS_COLORS["Other / Unknown"];
}

export function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

export function fmtRx(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
export function fmtUSD(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

const DATA_PRIMARY = "https://stasiprod1eus2.blob.core.windows.net/healthcare-public/us-rx-by-state.json";
const DATA_FALLBACK = "/demo/healthcare/us-rx-by-state.json";

export async function fetchRxData(): Promise<DataDoc> {
  try {
    const r = await fetch(DATA_PRIMARY, { cache: "no-store" });
    if (r.ok) return (await r.json()) as DataDoc;
  } catch {
    /* fall through */
  }
  const r2 = await fetch(DATA_FALLBACK);
  return (await r2.json()) as DataDoc;
}
