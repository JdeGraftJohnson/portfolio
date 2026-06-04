import fs from "node:fs";
import path from "node:path";
import { StrategyLab } from "@/components/demo/propfirmbot/StrategyLab";
import { SolanaLiveTracker } from "@/components/demo/propfirmbot/SolanaLiveTracker";

export const metadata = {
  title: "propfirmbot — Strategy Lab | John de Graft-Johnson",
  description:
    "Live status and trades anchored to Solana devnet, plus the interactive bdm_orb opening-range backtest across three micro futures: Gold (MGC), Oil (MCL), NASDAQ (MNQ).",
};

export default function Page() {
  const manifestPath = path.join(process.cwd(), "public", "demo", "propfirmbot", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  return (
    <>
      <SolanaLiveTracker />
      <StrategyLab manifest={manifest} />
    </>
  );
}
