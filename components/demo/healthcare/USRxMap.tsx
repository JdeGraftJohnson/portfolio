"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./USRxMapView").then((m) => m.USRxMapView), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 640,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.55)",
        fontSize: 13,
      }}
    >
      Loading map…
    </div>
  ),
});

export function USRxMap() {
  return <MapView />;
}
