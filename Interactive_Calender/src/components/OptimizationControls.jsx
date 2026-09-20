import React from "react";
import { reset as resetTelemetry } from "../store/renderTelemetry.js";

const TECHNIQUES = [
  { key: "memoOn", label: "React.memo" },
  { key: "useCallbackOn", label: "useCallback" },
  { key: "useMemoOn", label: "useMemo" },
];

function formatClock(date) {
  const time = date.toLocaleTimeString(undefined, { hour12: false });
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${time}.${ms}`;
}

export function OptimizationControls({ settings, onToggle, now }) {
  const liveClockOn = settings.liveClockOn;

  return (
    <div
      data-testid="optimization-controls"
      className="mb-4 rounded-lg border border-panel-line bg-panel-raised/40 px-3.5 py-2.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-ink-dim">
          Techniques
        </span>
        {TECHNIQUES.map(({ key, label }) => {
          const on = settings[key];
          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={on}
              data-testid={`toggle-${key}`}
              onClick={() => onToggle(key)}
              className={[
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors",
                on
                  ? "border-signal/50 bg-signal/10 text-signal"
                  : "border-flag/50 bg-flag/10 text-flag",
              ].join(" ")}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-signal" : "bg-flag"}`} />
              {label}: {on ? "ON" : "OFF"}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-panel-line pt-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={liveClockOn}
            data-testid="toggle-liveClockOn"
            onClick={() => onToggle("liveClockOn")}
            className={[
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors",
              liveClockOn
                ? "border-signal/50 bg-signal/10 text-signal"
                : "border-flag/50 bg-flag/10 text-flag",
            ].join(" ")}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${liveClockOn ? "bg-signal" : "bg-flag"}`} />
            Live clock: {liveClockOn ? "ON" : "OFF"}
          </button>

          <span
            data-testid="live-clock-readout"
            className="font-mono text-[11px] text-ink-dim"
          >
            {liveClockOn ? formatClock(now) : "paused"}
          </span>

          <span className="font-mono text-[10px] text-ink-faint">
            Ticks every 450ms to simulate unrelated state elsewhere in the app.
          </span>
        </div>

        <button
          type="button"
          onClick={() => resetTelemetry()}
          data-testid="reset-counters"
          className="rounded-lg border border-panel-line px-2.5 py-1 font-mono text-[11px] text-ink-dim transition-colors hover:border-signal hover:text-signal"
        >
          Reset counters
        </button>
      </div>
    </div>
  );
}
