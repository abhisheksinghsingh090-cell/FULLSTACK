import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App.jsx";
import { getCountsSnapshot, reset } from "./store/renderTelemetry.js";

beforeEach(() => {
  reset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function allDayCounts() {
  return [0, 1, 2, 3, 4, 5, 6].map((d) => getCountsSnapshot().get(`day-${d}`)?.count ?? 0);
}

async function tick(ms) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

test("live clock is off by default: readout shows paused, and time passing is a no-op", async () => {
  render(<App />);
  expect(screen.getByTestId("live-clock-readout")).toHaveTextContent("paused");

  await tick(450 * 3);

  expect(screen.getByTestId("live-clock-readout")).toHaveTextContent("paused");
  expect(allDayCounts().every((c) => c === 1)).toBe(true);
});

test("live clock ON, with React.memo + useCallback ON (default): ticking does not re-render the calendar at all", async () => {
  render(<App />);
  fireEvent.click(screen.getByTestId("toggle-liveClockOn"));

  await tick(450 * 3);

  // The readout is genuinely ticking...
  expect(screen.getByTestId("live-clock-readout")).not.toHaveTextContent("paused");
  // ...but every day column is fully protected: still just its initial mount.
  expect(allDayCounts().every((c) => c === 1)).toBe(true);
});

test("live clock ON, React.memo OFF: every column re-renders on every tick, uniformly", async () => {
  render(<App />);
  fireEvent.click(screen.getByTestId("toggle-memoOn")); // off — remounts columns, resetting counts to 1
  fireEvent.click(screen.getByTestId("toggle-liveClockOn"));

  await tick(450 * 3);

  const counts = allDayCounts();
  expect(counts.every((c) => c === counts[0])).toBe(true); // no selectivity at all
  expect(counts[0]).toBeGreaterThan(1); // and it genuinely grew from the ticks
});

test("live clock ON, useCallback OFF (React.memo still ON): unstable handlers still let every tick through", async () => {
  render(<App />);
  fireEvent.click(screen.getByTestId("toggle-useCallbackOn")); // off
  fireEvent.click(screen.getByTestId("toggle-liveClockOn"));

  await tick(450 * 3);

  const counts = allDayCounts();
  expect(counts.every((c) => c === counts[0])).toBe(true);
  expect(counts[0]).toBeGreaterThan(1);
});

test("Reset counters button clears the render telemetry store", () => {
  render(<App />);
  expect(getCountsSnapshot().get("day-0")?.count).toBe(1);

  fireEvent.click(screen.getByTestId("reset-counters"));

  expect(getCountsSnapshot().size).toBe(0);
});
