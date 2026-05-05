"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface UploadResult {
  valid: boolean;
  patient_count: number;
  lapse_rate_pct: number;
  ethnicity_coverage_pct: number;
  has_survival: boolean;
  has_ancestry: boolean;
  missing_required: string[];
  invalid_ethnicity_rows: number;
  preview: Record<string, unknown>[];
}

export interface PlotlyFigure {
  data: unknown[];
  layout: unknown;
}

export interface DisparityResult {
  overall: {
    accuracy: number;
    precision: number;
    recall: number;
    brier_score: number;
    eod_ethnicity: number;
    eod_imd: number;
    spd_ethnicity: number;
    spd_imd: number;
  };
  flags: string[];
  heatmap_plotly: PlotlyFigure | null;
  km_plotly: PlotlyFigure | null;
  km_p_value: number | null;
  km_significant: boolean | null;
  by_ethnicity: Record<string, unknown>[];
  by_imd: Record<string, unknown>[];
}

export interface GapRow {
  area: string;
  q1_rate: number;
  q5_rate: number;
  observed_gap: number;
  benchmark_gap: number;
  rag: "Green" | "Amber" | "Red";
}

export interface Core20Result {
  model_gap: number;
  flag: string | null;
  rows: GapRow[];
}

export interface AlignmentScores {
  [seedId: string]: { [dimension: string]: number };
}

export interface GmlpResponse {
  rating: "Yes" | "Partial" | "No" | "N/A";
  evidence: string;
}

export interface NiceEsfState {
  tier: "A" | "B" | "C" | null;
  checked: Record<string, boolean>;
  narrative: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

export interface AuditState {
  csvFile: File | null;
  csvB64: string | null;
  uploadResult: UploadResult | null;
  disparityResult: DisparityResult | null;
  core20Result: Core20Result | null;
  alignmentScores: AlignmentScores | null;
  gmlpResponses: Record<string, GmlpResponse>;
  niceEsfState: NiceEsfState;
  modelLabel: string;
  activeTab: number;
}

const initialState: AuditState = {
  csvFile: null,
  csvB64: null,
  uploadResult: null,
  disparityResult: null,
  core20Result: null,
  alignmentScores: null,
  gmlpResponses: {},
  niceEsfState: { tier: null, checked: {}, narrative: "" },
  modelLabel: "",
  activeTab: 0,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AuditAction =
  | { type: "SET_UPLOAD"; csvFile: File; csvB64: string; result: UploadResult }
  | { type: "SET_DISPARITY"; result: DisparityResult }
  | { type: "SET_CORE20"; result: Core20Result }
  | { type: "SET_ALIGNMENT"; scores: AlignmentScores }
  | { type: "SET_GMLP"; questionId: string; response: GmlpResponse }
  | { type: "SET_NICE_ESF"; state: Partial<NiceEsfState> }
  | { type: "SET_MODEL_LABEL"; label: string }
  | { type: "SET_ACTIVE_TAB"; tab: number }
  | { type: "RESET" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function auditReducer(state: AuditState, action: AuditAction): AuditState {
  switch (action.type) {
    case "SET_UPLOAD":
      return {
        ...state,
        csvFile: action.csvFile,
        csvB64: action.csvB64,
        uploadResult: action.result,
      };
    case "SET_DISPARITY":
      return { ...state, disparityResult: action.result };
    case "SET_CORE20":
      return { ...state, core20Result: action.result };
    case "SET_ALIGNMENT":
      return { ...state, alignmentScores: action.scores };
    case "SET_GMLP":
      return {
        ...state,
        gmlpResponses: {
          ...state.gmlpResponses,
          [action.questionId]: action.response,
        },
      };
    case "SET_NICE_ESF":
      return {
        ...state,
        niceEsfState: { ...state.niceEsfState, ...action.state },
      };
    case "SET_MODEL_LABEL":
      return { ...state, modelLabel: action.label };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.tab };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

type AuditContextValue = [AuditState, React.Dispatch<AuditAction>];

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(auditReducer, initialState);
  return (
    <AuditContext.Provider value={[state, dispatch]}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit(): AuditContextValue {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return ctx;
}
