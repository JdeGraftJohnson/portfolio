import fs from "node:fs";
import path from "node:path";
import { StrategyLab } from "@/components/demo/propfirmbot/StrategyLab";

export const metadata = {
  title: "propfirmbot — Strategy Lab | John de Graft-Johnson",
  description:
    "Interactive backtest viewer for the bdm_orb opening-range breakout across three micro futures: Gold (MGC), Oil (MCL), NASDAQ (MNQ). Hover any marker for trade detail.",
};

export default function Page() {
  const manifestPath = path.join(process.cwd(), "public", "demo", "propfirmbot", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  return <StrategyLab manifest={manifest} />;
}
