import React from "react";

export function Header({ rangeLabel, onPrevWeek, onNextWeek, onToday }) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
          Signal / Weekly schedule
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {rangeLabel}
        </h1>
      </div>

      <div className="flex items-center overflow-hidden rounded-lg border border-panel-line">
        <button
          onClick={onPrevWeek}
          className="px-3 py-1.5 text-ink-dim transition-colors hover:bg-panel-raised hover:text-ink"
          aria-label="Previous week"
        >
          ‹
        </button>
        <button
          onClick={onToday}
          className="border-x border-panel-line px-3 py-1.5 font-mono text-[11px] text-ink-dim transition-colors hover:bg-panel-raised hover:text-ink"
        >
          today
        </button>
        <button
          onClick={onNextWeek}
          className="px-3 py-1.5 text-ink-dim transition-colors hover:bg-panel-raised hover:text-ink"
          aria-label="Next week"
        >
          ›
        </button>
      </div>
    </header>
  );
}
