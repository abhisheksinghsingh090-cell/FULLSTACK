import React, { useSyncExternalStore } from "react";
import { subscribe, getLogSnapshot, getCountsSnapshot, reset } from "../store/renderTelemetry.js";

const CAUSE_STYLE = {
  mount: { label: "mount", dot: "bg-ink-faint" },
  "data-changed": { label: "data changed", dot: "bg-signal" },
  unrelated: { label: "unrelated re-render", dot: "bg-flag" },
};

export function RenderTrackerPanel() {
  const log = useSyncExternalStore(subscribe, getLogSnapshot);
  const counts = useSyncExternalStore(subscribe, getCountsSnapshot);

  const totals = Array.from(counts.values()).reduce(
    (acc, c) => acc + c.count,
    0
  );
  const unrelatedTotal = log.filter((l) => l.cause === "unrelated").length;

  return (
    <aside className="flex h-full flex-col rounded-xl border border-panel-line bg-panel-raised/60">
      <div className="flex items-center justify-between border-b border-panel-line px-3.5 py-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-dim">
            Render telemetry
          </p>
          <p className="text-sm font-semibold text-ink">
            {totals} render{totals === 1 ? "" : "s"} logged
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded border border-panel-line px-2 py-1 font-mono text-[10px] text-ink-dim transition-colors hover:border-signal hover:text-signal"
        >
          reset
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-panel-line px-3.5 py-2.5">
        <span className="font-mono text-[10px] text-ink-faint">
          {unrelatedTotal} unrelated in feed · fixed tasks only, drag to generate
        </span>
      </div>

      <ul className="telemetry-scroll flex-1 space-y-1 overflow-y-auto px-2.5 py-2.5" style={{ maxHeight: 360 }}>
        {log.length === 0 && (
          <li className="px-1 py-6 text-center font-mono text-[11px] text-ink-faint">
            Drag an event to generate telemetry
          </li>
        )}
        {log.map((entry, i) => {
          const style = CAUSE_STYLE[entry.cause] ?? CAUSE_STYLE.mount;
          return (
            <li
              key={`${entry.key}-${entry.ts}-${i}`}
              className="flex items-center justify-between rounded-md bg-panel px-2 py-1.5"
            >
              <span className="flex items-center gap-2 truncate">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                <span className="truncate font-mono text-[11px] text-ink">
                  {entry.name}
                  <span className="text-ink-faint">/{entry.key.split("-").slice(1).join("-")}</span>
                </span>
              </span>
              <span className="ml-2 shrink-0 font-mono text-[10px] text-ink-dim">
                {style.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-panel-line px-3.5 py-2.5 font-mono text-[10px] leading-relaxed text-ink-faint">
        Amber = component re-rendered while its own tracked data was
        unchanged. Use the technique switches above the calendar to compare
        React.memo / useMemo / useCallback on vs off.
      </div>
    </aside>
  );
}
