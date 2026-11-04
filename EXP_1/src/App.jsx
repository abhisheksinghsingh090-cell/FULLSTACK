import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header.jsx";
import { CalendarGrid } from "./components/CalendarGrid.jsx";
import { RenderTrackerPanel } from "./components/RenderTrackerPanel.jsx";
import { OptimizationControls } from "./components/OptimizationControls.jsx";
import { AddTaskModal } from "./components/AddTaskModal.jsx";
import { WeeklyInsights } from "./components/WeeklyInsights.jsx";
import { initialEvents, DAY_NAMES } from "./data/initialEvents.js";
import { generateTaskId } from "./utils/id.js";

function groupByDay(events) {
  const grouped = Array.from({ length: 7 }, () => []);
  events.forEach((e) => grouped[e.day].push(e));
  return grouped;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fetchEventsFromApi() {
  // Mirrors the PDF's MSW example (`GET /api/events`). In dev this just
  // resolves against local seed data; tests intercept this exact call with
  // Mock Service Worker instead of hitting a real network.
  return fetch("/api/events")
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
    .catch(() => initialEvents);
}

const DEFAULT_SETTINGS = {
  memoOn: true,
  useCallbackOn: true,
  useMemoOn: true,
  // Off by default: an idle app should genuinely stay idle. Flip it on to
  // see what a source of "unrelated" re-renders elsewhere in a real app
  // (a clock, a websocket ping, anything on an interval) does to the
  // calendar depending on how the other four switches are set.
  liveClockOn: false,
};

export default function App() {
  const [eventsByDay, setEventsByDay] = useState(() => groupByDay(initialEvents));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [source, setSource] = useState("seed");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [now, setNow] = useState(() => new Date());
  const [addModalDay, setAddModalDay] = useState(null); // null | day index

  const toggleSetting = useCallback((key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  // The live clock: a plain interval ticking App's own state every 450ms
  // while the switch is on. This is deliberately unrelated to the
  // calendar's data — its only purpose is to force App (and everything
  // that doesn't bail out via React.memo) to re-render on a schedule, so
  // you can see in the render telemetry exactly which of the four other
  // switches actually protect the calendar from unrelated churn elsewhere
  // in the app, and which don't.
  useEffect(() => {
    if (!settings.liveClockOn) return undefined;
    const id = setInterval(() => setNow(new Date()), 450);
    return () => clearInterval(id);
  }, [settings.liveClockOn]);

  const todayIndex = useMemo(() => {
    const diffDays = Math.round((startOfWeek(new Date()) - weekStart) / 86400000);
    return diffDays === 0 ? (new Date().getDay() + 6) % 7 : -1;
  }, [weekStart]);

  const weekDates = useMemo(() => {
    return DAY_NAMES.map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    });
  }, [weekStart]);

  const rangeLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(weekStart)} – ${fmt(end)}, ${end.getFullYear()}`;
  }, [weekStart]);

  // Which event is currently being dragged is tracked in a plain ref, not
  // state — see EventCard.jsx / DayColumn.jsx for why pickup/hover never
  // touch React state at all.
  const draggingIdRef = React.useRef(null);

  // --- Drag and drop, in both a memoized (useCallback) and raw form -------
  // The "raw" versions are plain functions, recreated fresh on every App
  // render. The "stable" versions are the exact same logic wrapped in
  // useCallback with an empty dependency array. Both are always defined
  // (you can't call a hook conditionally), and which one actually gets
  // handed down to the calendar is decided by the useCallback toggle. Since
  // the raw functions only close over a ref and the setState functions
  // (both of which React guarantees are stable across renders), the
  // "cached" useCallback version behaves identically to a freshly created
  // one — the only difference the toggle demonstrates is *referential
  // identity*, which is exactly what breaks/preserves React.memo.
  const rawHandleDragStartEvent = (e, event) => {
    draggingIdRef.current = event.id;
    e.dataTransfer.setData("text/plain", event.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const stableHandleDragStartEvent = useCallback(rawHandleDragStartEvent, []);

  const rawHandleDragEndEvent = () => {
    draggingIdRef.current = null;
  };
  const stableHandleDragEndEvent = useCallback(rawHandleDragEndEvent, []);

  const rawHandleDrop = (targetDay) => {
    setEventsByDay((prev) => {
      let fromDay = -1;
      let moved = null;
      for (let d = 0; d < 7; d++) {
        const found = prev[d].find((e) => e.id === draggingIdRef.current);
        if (found) {
          fromDay = d;
          moved = found;
          break;
        }
      }
      if (!moved || fromDay === targetDay) return prev;

      // Only the two affected day arrays get new references — every other
      // day keeps the exact array it had last render. That reference
      // stability is what lets a memoized DayColumn skip re-rendering for
      // the five days nothing happened in.
      const next = prev.slice();
      next[fromDay] = prev[fromDay].filter((e) => e.id !== moved.id);
      next[targetDay] = [...prev[targetDay], { ...moved, day: targetDay }];
      return next;
    });
  };
  const stableHandleDrop = useCallback(rawHandleDrop, []);

  const handleDragStartEvent = settings.useCallbackOn
    ? stableHandleDragStartEvent
    : rawHandleDragStartEvent;
  const handleDragEndEvent = settings.useCallbackOn
    ? stableHandleDragEndEvent
    : rawHandleDragEndEvent;
  const handleDrop = settings.useCallbackOn ? stableHandleDrop : rawHandleDrop;

  const handleImportFromApi = useCallback(async () => {
    setSource("loading");
    const events = await fetchEventsFromApi();
    setEventsByDay(groupByDay(events));
    setSource("api");
  }, []);

  // --- Add / delete ---------------------------------------------------------
  // Deliberately not gated behind the useCallback toggle above — that
  // toggle is about the drag demo specifically. These stay stable
  // regardless, so adding or deleting a task never itself breaks
  // React.memo for the days nothing happened to.
  const openAddModal = useCallback((day) => setAddModalDay(day), []);
  const closeAddModal = useCallback(() => setAddModalDay(null), []);

  const handleAddTask = useCallback((formData) => {
    setEventsByDay((prev) => {
      const next = prev.slice();
      const newEvent = { id: generateTaskId(), ...formData };
      next[formData.day] = [...prev[formData.day], newEvent];
      return next;
    });
    setAddModalDay(null);
  }, []);

  const handleDeleteTask = useCallback((id) => {
    setEventsByDay((prev) => {
      let fromDay = -1;
      for (let d = 0; d < prev.length; d++) {
        if (prev[d].some((e) => e.id === id)) {
          fromDay = d;
          break;
        }
      }
      if (fromDay === -1) return prev;
      // Same reference-stability rule as everywhere else: only the one
      // affected day array gets a new reference.
      const next = prev.slice();
      next[fromDay] = prev[fromDay].filter((e) => e.id !== id);
      return next;
    });
  }, []);

  const totalEvents = useMemo(
    () => eventsByDay.reduce((sum, day) => sum + day.length, 0),
    [eventsByDay]
  );

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <Header
          rangeLabel={rangeLabel}
          onPrevWeek={() => setWeekStart((d) => new Date(d.getTime() - 7 * 86400000))}
          onNextWeek={() => setWeekStart((d) => new Date(d.getTime() + 7 * 86400000))}
          onToday={() => setWeekStart(startOfWeek(new Date()))}
        />

        <OptimizationControls settings={settings} onToggle={toggleSetting} now={now} />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-panel-line bg-panel-raised/40 px-3.5 py-2 font-mono text-[11px] text-ink-dim">
          <span>
            {totalEvents} tasks this week · source: {source}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal(todayIndex >= 0 ? todayIndex : 0)}
              className="rounded border border-signal/40 bg-signal/10 px-2 py-1 text-signal transition-colors hover:bg-signal/20"
            >
              + new task
            </button>
            <button
              onClick={handleImportFromApi}
              className="rounded border border-panel-line px-2 py-1 text-ink-dim transition-colors hover:border-signal hover:text-signal"
            >
              refetch via /api/events (MSW-mocked in tests)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_300px]">
          <CalendarGrid
            weekDates={weekDates}
            eventsByDay={eventsByDay}
            onDrop={handleDrop}
            onDragStartEvent={handleDragStartEvent}
            onDragEndEvent={handleDragEndEvent}
            onAddTask={openAddModal}
            onDeleteTask={handleDeleteTask}
            memoOn={settings.memoOn}
            useMemoOn={settings.useMemoOn}
            todayIndex={todayIndex}
          />

          <div className="flex flex-col gap-3">
            <RenderTrackerPanel />
            <WeeklyInsights eventsByDay={eventsByDay} />
          </div>
        </div>
      </div>

      {addModalDay !== null && (
        <AddTaskModal day={addModalDay} onCreate={handleAddTask} onClose={closeAddModal} />
      )}
    </div>
  );
}
