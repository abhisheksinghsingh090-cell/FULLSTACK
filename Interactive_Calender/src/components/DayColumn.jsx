import React, { memo, useMemo } from "react";
import { EventCard, EventCardUnoptimized } from "./EventCard.jsx";
import { useRenderFlash } from "../hooks/useRenderFlash.js";

const OVER_CLASSES = ["border-signal", "bg-signal/5"];
const IDLE_CLASSES = ["border-panel-line"];

function sortByTime(events) {
  return [...events].sort((a, b) => a.time.localeCompare(b.time));
}

function DayColumnBase({
  day,
  dayName,
  dateLabel,
  isToday,
  events,
  onDrop,
  onDragStartEvent,
  onDragEndEvent,
  onAddTask = () => {},
  onDeleteTask = () => {},
  memoOn,
  useMemoOn,
}) {
  // Same pattern as the PDF's `filteredEvents` useMemo example: recompute
  // only when this day's own event list actually changes — but only when
  // the useMemo toggle is ON. When it's OFF, `sortedRaw` is recomputed on
  // every render regardless of whether `events` changed, to make the
  // "wasted work" the toggle controls actually visible/real, not just a
  // label. (The memoized version is still computed either way — you can't
  // conditionally call a hook — but only its result is *used* when ON.)
  const sortedMemo = useMemo(() => sortByTime(events), [events]);
  const sortedRaw = sortByTime(events);
  const sorted = useMemoOn ? sortedMemo : sortedRaw;

  // watchKey fingerprints only what THIS column actually renders. If the
  // column re-renders while this is unchanged, it was an unrelated re-render.
  const watchKey = sorted.map((e) => e.id).join(",");
  const { cause, renderCount, nodeRef } = useRenderFlash(`day-${day}`, "DayColumn", watchKey);

  const Card = memoOn ? EventCard : EventCardUnoptimized;

  // Drag-over highlight is applied directly to this node's classList, not
  // via React state. Hovering a column while dragging doesn't change any
  // event's data, so — like the opacity lift in EventCard — it shouldn't
  // cause a React re-render at all, here or anywhere else.
  const setOver = (isOver) => {
    const el = nodeRef.current;
    if (!el) return;
    el.classList.remove(...(isOver ? IDLE_CLASSES : OVER_CLASSES));
    el.classList.add(...(isOver ? OVER_CLASSES : IDLE_CLASSES));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setOver(true);
  };

  const handleDragLeave = () => setOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setOver(false);
    onDrop(day);
  };

  return (
    <div
      ref={nodeRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`day-column-${day}`}
      data-render-cause={cause}
      className="flex min-h-[420px] flex-col rounded-xl border border-panel-line bg-panel-raised/60 p-2.5 transition-colors"
    >
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-dim">{dayName}</p>
          <p className={`text-sm font-semibold ${isToday ? "text-signal" : "text-ink"}`}>
            {dateLabel}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Actual task count for this day — always correct, up or down,
              because it's read straight from `sorted.length` every render. */}
          <span
            className="rounded bg-signal/10 px-1.5 py-0.5 font-mono text-[10px] text-signal"
            title="tasks currently on this day"
            data-testid={`day-task-count-${day}`}
          >
            {sorted.length} task{sorted.length === 1 ? "" : "s"}
          </span>
          {/* Separate render diagnostic — NOT a task count, and it's
              expected to only ever go up (renders accumulate). */}
          <span
            className="rounded bg-panel px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
            title="diagnostic only — how many times THIS COLUMN has re-rendered, not a task count."
            data-testid={`day-render-count-${day}`}
          >
            {renderCount}x rendered
          </span>
        </div>
      </div>

      <div className="flex-1">
        {sorted.length === 0 && (
          <p className="mt-6 text-center font-mono text-[11px] text-ink-faint">— empty —</p>
        )}
        {sorted.map((event) => (
          <Card
            key={event.id}
            event={event}
            onDragStart={onDragStartEvent}
            onDragEnd={onDragEndEvent}
            onDelete={onDeleteTask}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddTask(day)}
        data-testid={`add-task-${day}`}
        className="mt-2 rounded-lg border border-dashed border-panel-line py-1.5 font-mono text-[11px] text-ink-faint transition-colors hover:border-signal hover:text-signal"
      >
        + add task
      </button>
    </div>
  );
}

export const DayColumn = memo(DayColumnBase);
export const DayColumnUnoptimized = DayColumnBase;
