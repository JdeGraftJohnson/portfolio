"use client";

import { CSSProperties } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { AuditProvider, useAudit } from "./AuditContext";

import DisparityTab from "./DisparityTab";
import GmlpTab from "./GmlpTab";
import NiceEsfTab from "./NiceEsfTab";
import Core20Tab from "./Core20Tab";
import AlignmentTab from "./AlignmentTab";
import ExportTab from "./ExportTab";
import ObservabilityTab from "./ObservabilityTab";
import UploadTab from "./UploadTab";

// ─── Tab definitions ─────────────────────────────────────────────────────────

interface TabDef {
  label: string;
  index: number;
}

const TABS: TabDef[] = [
  { label: "① Upload",        index: 0 },
  { label: "② Disparity",     index: 1 },
  { label: "③ GMLP",          index: 2 },
  { label: "④ NICE ESF",      index: 3 },
  { label: "⑤ Core20PLUS5",   index: 4 },
  { label: "⑥ LLM Alignment", index: 5 },
  { label: "⑦ Export",        index: 6 },
  { label: "⑧ Observability", index: 7 },
];

// ─── Inner shell (needs AuditContext) ────────────────────────────────────────

function AuditShellInner() {
  const [state, dispatch] = useAudit();
  const { activeTab, uploadResult } = state;

  function handleTabClick(index: number) {
    const locked = isLocked(index);
    if (locked) return;
    dispatch({ type: "SET_ACTIVE_TAB", tab: index });
  }

  function isLocked(index: number): boolean {
    if (index === 0) return false;
    // All tabs after Upload are locked until upload is complete
    if (!uploadResult) return true;
    return false;
  }

  const tabBarStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    overflowX: "auto",
    padding: "0 24px",
    marginBottom: 24,
    scrollbarWidth: "none",
  };

  const activeTabStyle: CSSProperties = {
    background: `${tokens.accent}26`, // accent at ~15% opacity
    color: tokens.accent,
    border: `1px solid ${tokens.accent}66`, // accent at ~40% opacity
  };

  const inactiveTabStyle: CSSProperties = {
    background: "transparent",
    color: tokens.muted,
    border: "1px solid transparent",
  };

  function tabStyle(index: number): CSSProperties {
    const active = index === activeTab;
    const locked = isLocked(index);
    return {
      flexShrink: 0,
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      padding: "8px 16px",
      borderRadius: 20,
      cursor: locked ? "not-allowed" : "pointer",
      ...(active ? activeTabStyle : inactiveTabStyle),
      opacity: locked ? 0.4 : 1,
      transition: "background 200ms ease, color 200ms ease, border-color 200ms ease",
      outline: "none",
      userSelect: "none",
    };
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 64 }}>
      {/* Tab bar */}
      <div role="tablist" style={tabBarStyle} aria-label="Audit sections">
        {TABS.map((tab) => (
          <button
            key={tab.index}
            onClick={() => handleTabClick(tab.index)}
            style={tabStyle(tab.index)}
            aria-selected={activeTab === tab.index}
            role="tab"
            disabled={isLocked(tab.index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: "0 24px" }}
      >
        {activeTab === 0 && <UploadTab />}
        {activeTab === 1 && <DisparityTab />}
        {activeTab === 2 && <GmlpTab />}
        {activeTab === 3 && <NiceEsfTab />}
        {activeTab === 4 && <Core20Tab />}
        {activeTab === 5 && <AlignmentTab />}
        {activeTab === 6 && <ExportTab />}
        {activeTab === 7 && <ObservabilityTab />}
      </motion.div>
    </div>
  );
}

// ─── Public export (wraps with AuditProvider) ────────────────────────────────

export function AuditShell() {
  return (
    <AuditProvider>
      <AuditShellInner />
    </AuditProvider>
  );
}
