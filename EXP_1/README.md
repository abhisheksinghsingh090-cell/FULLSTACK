# Signal — Interactive Calendar & Render Telemetry

A 7-day drag-and-drop calendar built for Experiment 4 (*Interactive Calendar
Optimization & Testing*), with three independently switchable optimization
techniques — `React.memo`, `useCallback`, and `useMemo` — and a live "render
telemetry" panel that shows exactly which components re-render, and which
of those renders were unnecessary, as you try each combination.

The task set starts from 15 seeded tasks, and you can drag them between
days, add new ones, and delete any of them — there's no *edit* feature by
design, to keep the render-telemetry story simple (an edit would just be a
delete + add anyway, in terms of what it does to render counts).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # production build
npm test            # Jest + React Testing Library
npm run coverage    # Jest with a coverage report
```

## What to try

1. Click **`+ new task`** in the toolbar, or **`+ add task`** at the bottom
   of any day column, to create a task. Hover any task card and click the
   **✕** in its corner to delete it — both only ever touch the one day
   they affect, same as a drag.
2. Drag any event card to a different day. With all three switches at their
   default **ON**, only the two affected day columns re-render — everything
   else is untouched. The render telemetry panel on the right logs this
   live, and each day's two badges show it directly: **`N tasks`** (the
   real, always-correct count) and **`Nx rendered`** (a separate render
   diagnostic that only ever goes up — see "Two different badges" below).
3. Flip **`React.memo`** off, then drag an event. Every day column now
   re-renders on every move, not just the two affected ones — React.memo
   is what gave you that selectivity.
4. Turn `React.memo` back on but flip **`useCallback`** off, then drag
   again. You'll see the *same* every-column re-render as step 3, for a
   different reason: the drag handlers are now recreated on every render,
   so React.memo's prop comparison sees "changed" props for every column
   even though the actual event data didn't change for most of them.
5. Flip **`useMemo`** off. The per-day sort still works correctly — this
   toggle is about compute cost (recomputing the sorted list every render
   instead of reusing a cached one), not about whether re-renders happen at
   all, so you won't see a visible difference in *what* renders, only in
   *how much work* each render does.
6. Any combination of the three works together — including all three off
   at once — the calendar, drag-and-drop, add, and delete all stay fully
   functional either way.
7. Flip **`Live clock`** on (bottom row, off by default) and *don't touch
   anything else*. It ticks its own readout every 450ms with `React.memo`
   and `useCallback` at their defaults — and every day column's render
   count stays exactly where it was. Now flip `React.memo` or `useCallback`
   off and watch the same clock: every column's render count climbs on
   every single tick, continuously, with no dragging involved at all. This
   is the clearest version of the demo — a real app always has *something*
   ticking elsewhere (a clock, a websocket, a polling timer), and this
   switch simulates exactly that.

## Two different badges, on purpose

Each day's header has two badges that look similar but measure different
things:

- **`N tasks`** (teal) — the real, current task count, read straight from
  `sorted.length` every render. Drag a task out and it goes down; drop one
  in (or add/delete one) and it changes accordingly.
- **`Nx rendered`** (grey, with a tooltip) — a render-count *diagnostic* for
  the telemetry demo. It's expected to only ever increase — it counts how
  many times this component instance has rendered since mount, and says
  nothing about how many tasks are on that day right now.

## How each part of the PDF is covered

| PDF section | Where it lives |
|---|---|
| 7-day interactive calendar, event-driven UI | `src/components/CalendarGrid.jsx`, `DayColumn.jsx` |
| Drag-and-drop (drag source / drop target / state update on drop) | `EventCard.jsx` (`draggable`, `onDragStart`), `DayColumn.jsx` (`onDragOver`/`onDrop`), `App.jsx` (`handleDrop`) |
| `React.memo` — component-level optimization, switchable | `EventCard`/`DayColumn` exported both memoized and plain; `CalendarGrid`/`DayColumn` pick based on the `memoOn` switch |
| `useCallback` — referential stability, switchable | `App.jsx` defines each drag handler in both a raw and a `useCallback`-wrapped form and picks based on the `useCallbackOn` switch |
| `useMemo` — expensive computation optimization, switchable | `DayColumn.jsx` computes the sorted event list both via `useMemo` and freshly every render, and picks based on the `useMemoOn` switch |
| Simulating "unrelated" state elsewhere in a real app | `App.jsx`'s `liveClockOn` switch + `now` state, ticking every 450ms via `setInterval` — off by default, purely to demonstrate what an unrelated timer does to the calendar under each combination of the other switches |
| Stable keys vs. array-index keys | Every list is keyed by `event.id` / day index, never array position (see comment in `initialEvents.js`) |
| Add / delete a task | `src/components/AddTaskModal.jsx` (create form), `EventCard.jsx` (hover delete button), wired through `App.jsx` (`handleAddTask`, `handleDeleteTask`) — each only ever replaces the one day array it affects |
| Component re-render analysis / "why did this render" | `src/store/renderTelemetry.js` + `src/hooks/useRenderFlash.js` + `RenderTrackerPanel.jsx` — a live, in-app analogue of React DevTools' Profiler "why did this render" view |
| React DevTools profiling | Works as normal on top of this app — Profiler tab will corroborate what the in-app telemetry panel shows |
| Testing with React Testing Library, "test behavior not implementation" | `src/components/__tests__/EventCard.test.jsx`, `CalendarGrid.test.jsx`, `AddTaskModal.test.jsx`, `src/App.test.jsx`, `src/App.liveClock.test.jsx` |
| API mocking with Mock Service Worker | `src/mocks/handlers.js`, `src/mocks/server.js`, wired up in `src/setupTests.js`; exercised by the "refetch via `/api/events`" button and its test |
| Jest coverage | `npm run coverage` (config in `jest.config.cjs`) |

## Notable implementation details

- **The three switches are independent state, not one combined flag.**
  `App.jsx` holds `settings = { memoOn, useCallbackOn, useMemoOn }`.
  `memoOn` picks which component *export* (memoized vs. plain) gets
  rendered; `useCallbackOn` picks between a `useCallback`-wrapped and a
  freshly-created handler on every App render; `useMemoOn` picks between a
  cached and a freshly-computed sorted list inside `DayColumn`. Because
  React's rules of hooks don't allow calling a hook conditionally, both the
  memoized and raw versions are always computed — only *which one gets
  used* is conditional, so toggling never breaks the rules of hooks.
- **Toggling `memoOn` genuinely remounts every day column.** Switching
  which component export is rendered at a given JSX position (memoized vs.
  plain — they're different component identities to React) isn't a normal
  re-render, it's an unmount-of-the-old / mount-of-the-new. You'll see
  every day's `Nx rendered` badge reset to `1` the instant you flip that
  switch, before you've dragged anything.
- **Per-day state, not one flat array.** Events are stored as
  `eventsByDay: Event[][]` (one array per day) rather than a single flat
  list. Moving, adding, or deleting an event only replaces the affected
  day array(s) — every other day keeps the exact same array reference
  across the update. That's what makes `React.memo` on `DayColumn` able to
  skip re-rendering the untouched columns in the first place.
- **The telemetry store is a plain module-level pub/sub, not React
  context.** If it were context, every tracked component would need to
  *read* it too — which would itself force re-renders and contaminate the
  measurement. Components only ever write to it (`logRender`); only
  `RenderTrackerPanel` subscribes, via `useSyncExternalStore`.
- **Nothing about dragging touches React state.** Picking a card up and
  hovering a column are handled by writing directly to the DOM
  (`element.style.opacity`, `element.classList`) through refs — not
  `useState`. Only the actual drop, which calls `setEventsByDay`, goes
  through React.
- **`useRenderFlash` never calls `setState`.** It restarts its flash
  animation by mutating the DOM node directly via a ref, so logging a
  render can never cause one — see the comment at the top of
  `src/hooks/useRenderFlash.js`.
- **`React.StrictMode` is intentionally not used.** It double-invokes
  render (and mount effects) in dev to catch impure components, which
  would double every number in the telemetry panel — the opposite of what
  a render-counting demo needs.
- **The live clock is off by default, on purpose.** An idle app should
  genuinely stay idle — that's what the "idle app does not keep
  re-rendering itself" regression test checks. Turning the clock on is an
  opt-in way to see what a realistic source of unrelated churn (this
  simulates a timer, but it stands in for a websocket, a polling call,
  anything on an interval elsewhere in a larger app) does to the calendar
  under each combination of the other switches — and its tests
  (`App.liveClock.test.jsx`) use Jest's fake timers to advance it
  deterministically rather than waiting on real 450ms intervals.
- **Add and delete follow the same reference-stability rule as drag and
  drop.** `handleAddTask` only replaces the array for the day the task was
  added to; `handleDeleteTask` only replaces the array for the day the
  deleted task was on. Every other day keeps its existing array reference,
  so — with `memoOn` and `useCallbackOn` on — adding or deleting one task
  only re-renders that single `DayColumn`, not all seven (see the
  `"...only re-renders the day..."` tests in `App.test.jsx`). The delete
  button also calls `stopPropagation()` on its own `mousedown` and sets
  `draggable={false}`, since it lives inside a `draggable` card — without
  that, clicking it could occasionally be interpreted as starting a drag
  instead of firing a click.
- **`jest-fixed-jsdom`** is used instead of plain `jest-environment-jsdom`
  because MSW needs native `fetch`/`Request`/`Response` globals that
  stock jsdom doesn't provide.

## Project structure

```
src/
  App.jsx                       root state, technique + live-clock settings, drag/add/delete handlers, week math
  App.test.jsx                  core calendar / drag / add / delete / toggle tests
  App.liveClock.test.jsx        live clock behavior under each toggle combination
  components/
    Header.jsx                   week navigation
    OptimizationControls.jsx     the three technique switches + live clock + reset
    CalendarGrid.jsx              7-day layout
    DayColumn.jsx                   drop target for one day, "+ add task"
    EventCard.jsx                    draggable task with hover delete button
    AddTaskModal.jsx              create-task form (no edit, by design)
    RenderTrackerPanel.jsx       live telemetry feed
    WeeklyInsights.jsx           simple derived stats panel
    __tests__/                   RTL tests
  data/initialEvents.js          seed data
  hooks/useRenderFlash.js        per-component render instrumentation
  store/renderTelemetry.js       pub/sub store behind the telemetry panel
  utils/id.js                   id generator for new tasks
  mocks/{handlers,server}.js     MSW
  setupTests.js                   jest-dom + MSW lifecycle
```
