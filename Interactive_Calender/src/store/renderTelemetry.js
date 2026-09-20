// Render telemetry store
// --------------------------------------------------------------------------
// This is a plain module-level pub/sub store, NOT a React context. That's
// deliberate: if this lived in context, every component that logs a render
// would need to *read* that context too, which would itself cause more
// re-renders and contaminate the very measurement we're trying to show.
// Components only ever WRITE here (fire-and-forget); only <RenderTracker>
// subscribes to read, via useSyncExternalStore.

let counts = new Map(); // key -> { name, count, lastCause }
let log = []; // recent render events, newest first
const listeners = new Set();
const MAX_LOG = 40;

function emit() {
  listeners.forEach((fn) => fn());
}

export function logRender(key, name, cause) {
  const prev = counts.get(key);
  const entry = {
    name,
    count: (prev?.count ?? 0) + 1,
    lastCause: cause,
    ts: performance.now(),
  };
  counts = new Map(counts);
  counts.set(key, entry);

  log = [{ key, name, cause, ts: entry.ts }, ...log].slice(0, MAX_LOG);
  emit();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getCountsSnapshot() {
  return counts;
}

export function getLogSnapshot() {
  return log;
}

export function reset() {
  counts = new Map();
  log = [];
  emit();
}
