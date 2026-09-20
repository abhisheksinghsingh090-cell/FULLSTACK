import React, { memo } from "react";
import { TAG_COLORS } from "../data/initialEvents.js";
import { useRenderFlash } from "../hooks/useRenderFlash.js";

function EventCardBase({ event, onDragStart, onDragEnd, onDelete = () => {} }) {
  const watchKey = `${event.id}|${event.title}|${event.time}|${event.tag}`;
  const { cause, renderCount, nodeRef } = useRenderFlash(
    `event-${event.id}`,
    "EventCard",
    watchKey
  );

  const colors = TAG_COLORS[event.tag] ?? TAG_COLORS.work;

  // Drag-lift opacity is applied directly to this node in the drag
  // handlers below, not via React state — picking a card up or letting it
  // go doesn't change any event's data, so it shouldn't cause a React
  // re-render at all, on this card or any other.
  const handleDragStart = (e) => {
    e.currentTarget.style.opacity = "0.4";
    onDragStart(e, event);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    onDragEnd(e);
  };

  // The delete button sits inside a draggable card, so its own mousedown
  // must never be allowed to bubble into the drag machinery — otherwise
  // clicking it could occasionally start a drag instead of firing a click.
  const handleDeleteMouseDown = (e) => e.stopPropagation();
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(event.id);
  };

  return (
    <div
      ref={nodeRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-testid={`event-${event.id}`}
      data-render-cause={cause}
      title={`${event.title} · rendered ${renderCount}x`}
      className={[
        "group relative mb-2 cursor-grab select-none rounded-lg border px-3 py-2 text-left",
        "active:cursor-grabbing transition-[opacity,background-color,border-color]",
        colors.bg,
        colors.border,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
        <span className="font-mono text-[11px] text-ink-dim">{event.time}</span>
      </div>
      <p className="mt-1 truncate pr-4 text-sm font-medium text-ink">{event.title}</p>

      <button
        type="button"
        draggable={false}
        onMouseDown={handleDeleteMouseDown}
        onClick={handleDeleteClick}
        aria-label={`Delete ${event.title}`}
        data-testid={`delete-${event.id}`}
        className="absolute right-1.5 top-1.5 rounded px-1 font-mono text-[11px] leading-none text-ink-faint opacity-0 transition-colors hover:bg-alert/20 hover:text-alert group-hover:opacity-100"
      >
        ✕
      </button>

      <span
        className="pointer-events-none absolute bottom-1 right-1.5 rounded bg-panel/80 px-1 font-mono text-[9px] text-ink-faint opacity-0 group-hover:opacity-100"
        aria-hidden="true"
      >
        ×{renderCount}
      </span>
    </div>
  );
}

export const EventCard = memo(EventCardBase);
export const EventCardUnoptimized = EventCardBase;
