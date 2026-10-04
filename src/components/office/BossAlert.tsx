import { useEffect, useState } from "react";

type Phase = "idle" | "countdown" | "working" | "gone";

export function BossAlert() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (phase === "countdown") {
      if (count > 0) {
        const t = setTimeout(() => setCount((c) => c - 1), 700);
        return () => clearTimeout(t);
      }
      setPhase("working");
      return;
    }
    if (phase === "working") {
      const t = setTimeout(() => setPhase("gone"), 4500);
      return () => clearTimeout(t);
    }
    if (phase === "gone") {
      const t = setTimeout(() => setPhase("idle"), 1800);
      return () => clearTimeout(t);
    }
    return;
  }, [phase, count]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCount(3);
          setPhase("countdown");
        }}
        className="press-btn fixed bottom-4 right-4 z-40 rounded-full bg-destructive px-4 py-2.5 text-sm font-bold tracking-wide text-destructive-foreground active:press-btn-active"
      >
        🚨 BOSS IS COMING
      </button>

      {phase !== "idle" && (
        <div className="fixed inset-0 z-50 overflow-auto bg-background">
          {phase === "countdown" && (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-destructive px-6 text-center text-destructive-foreground">
              <p className="font-display text-4xl sm:text-6xl">⚠️ BOSS DETECTED</p>
              <p className="text-lg font-semibold tracking-[0.3em]">ACT PROFESSIONAL.</p>
              <p className="font-display text-7xl">{count > 0 ? count : "…"}</p>
            </div>
          )}

          {phase === "working" && <FakeWorkScreen />}

          {phase === "gone" && (
            <div className="flex min-h-screen items-center justify-center bg-forest px-6 text-center">
              <p className="font-display text-4xl text-primary-foreground sm:text-6xl">
                😎 Boss Gone
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const ROWS = [
  ["Q1 Revenue", "12,40,000", "18%", "On Track"],
  ["Q2 Revenue", "14,85,000", "21%", "On Track"],
  ["Q3 Forecast", "16,10,000", "9%", "At Risk"],
  ["Q4 Forecast", "19,75,000", "23%", "Planned"],
  ["Opex", "7,32,400", "-4%", "Reviewed"],
  ["Headcount", "148", "6%", "Approved"],
  ["Churn", "2.4%", "-0.3%", "Healthy"],
  ["Runway", "22 months", "—", "Stable"],
];

function FakeWorkScreen() {
  return (
    <div className="min-h-screen bg-white p-4 font-sans text-[13px] text-slate-800">
      <div className="mb-2 flex items-center gap-4 border-b border-slate-300 pb-2 text-slate-600">
        <span className="font-semibold">FY26_Financial_Model_v14_FINAL_final.xlsx</span>
        <span>File</span>
        <span>Home</span>
        <span>Insert</span>
        <span>Formulas</span>
        <span>Data</span>
        <span>Review</span>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="border border-slate-300 px-2 py-1">Metric</th>
            <th className="border border-slate-300 px-2 py-1">Value</th>
            <th className="border border-slate-300 px-2 py-1">Delta</th>
            <th className="border border-slate-300 px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).flatMap((_, block) =>
            ROWS.map((row, i) => (
              <tr key={`${block}-${i}`} className={i % 2 ? "bg-slate-50" : ""}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-slate-200 px-2 py-1 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-500">
        Sheet1 | Sheet2 | Consolidated | Assumptions — Ready
      </p>
    </div>
  );
}
