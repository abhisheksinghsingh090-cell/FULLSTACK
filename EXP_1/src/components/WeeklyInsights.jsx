import React from "react";
import { DAY_NAMES } from "../data/initialEvents.js";

export function WeeklyInsights({ eventsByDay }) {
  const total = eventsByDay.reduce((sum, day) => sum + day.length, 0);
  const busiestIndex = eventsByDay.reduce(
    (best, day, i) => (day.length > eventsByDay[best].length ? i : best),
    0
  );
  const tagCounts = eventsByDay.flat().reduce((acc, e) => {
    acc[e.tag] = (acc[e.tag] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      data-testid="weekly-insights"
      className="rounded-xl border border-panel-line bg-panel-raised/60 p-3.5"
    >
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-dim">
        Weekly insights
      </p>
      <p className="mt-1 text-sm text-ink">{total} tasks across the week</p>
      <p className="mt-1 font-mono text-[11px] text-ink-dim">
        Busiest day:{" "}
        <span className="text-signal">
          {DAY_NAMES[busiestIndex]} ({eventsByDay[busiestIndex].length})
        </span>
      </p>
      <ul className="mt-2 space-y-1 font-mono text-[11px] text-ink-dim">
        {Object.entries(tagCounts).map(([tag, count]) => (
          <li key={tag} className="flex justify-between">
            <span>{tag}</span>
            <span className="text-ink">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
