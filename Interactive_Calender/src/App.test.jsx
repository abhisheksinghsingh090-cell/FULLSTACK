import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { getCountsSnapshot, reset } from "./store/renderTelemetry.js";

beforeEach(() => reset());

function dayTaskCount(testId) {
  return Number(screen.getByTestId(testId).textContent.match(/^(\d+)/)[1]);
}

function dragEvent(cardTestId, targetColumnTestId, eventId) {
  const card = screen.getByTestId(cardTestId);
  const target = screen.getByTestId(targetColumnTestId);
  const dataTransfer = { setData: jest.fn(), getData: jest.fn(() => eventId), effectAllowed: "" };
  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(card, { dataTransfer });
}

test("renders the weekly calendar with seed events", async () => {
  render(<App />);
  expect(screen.getByText("Design review")).toBeInTheDocument();
  expect(screen.getByText(/tasks this week/)).toBeInTheDocument();
  // Weekly insights is now a plain, always-eagerly-rendered component —
  // just confirm it's actually there.
  await screen.findByText("Weekly insights");
});

test("refetching from /api/events (MSW-mocked) reloads the schedule", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByText(/refetch via \/api\/events/));

  expect(await screen.findByText(/source: api/)).toBeInTheDocument();
  expect(screen.getByText("Design review")).toBeInTheDocument();
});

// --- Optimization controls ------------------------------------------------
test("all three technique switches default to ON and toggle independently", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  const panel = screen.getByTestId("optimization-controls");
  ["memoOn", "useCallbackOn", "useMemoOn"].forEach((key) => {
    expect(within(panel).getByTestId(`toggle-${key}`)).toHaveTextContent("ON");
  });

  await user.click(within(panel).getByTestId("toggle-memoOn"));
  expect(within(panel).getByTestId("toggle-memoOn")).toHaveTextContent("OFF");
  // The others are untouched.
  expect(within(panel).getByTestId("toggle-useCallbackOn")).toHaveTextContent("ON");
  expect(within(panel).getByTestId("toggle-useMemoOn")).toHaveTextContent("ON");
});

// Regression test for a real bug: an earlier version of the render-flash
// hook called setState inside an unconditional useEffect to restart a CSS
// animation, which re-triggered the same effect on every commit — an
// infinite render loop that looked like the app was "auto re-rendering all
// the time" with no user interaction. The fix moved the flash entirely
// onto the DOM (see useRenderFlash.js), so mounting should log exactly one
// render per component and then go quiet.
test("idle app does not keep re-rendering itself after mount", async () => {
  render(<App />);
  await screen.findByText("Weekly insights");

  const designReviewEntry = screen.getByTitle(/Design review/);
  const beforeCount = designReviewEntry.title.match(/rendered (\d+)x/)[1];

  await new Promise((resolve) => setTimeout(resolve, 300));

  const afterCount = designReviewEntry.title.match(/rendered (\d+)x/)[1];
  expect(afterCount).toBe(beforeCount);
  expect(getCountsSnapshot().get("day-0")?.count ?? 0).toBe(1);
});

// This is the exact scenario the render telemetry panel exists to show:
// with all four techniques ON (the default), dragging one event from
// Monday to Wednesday should re-render precisely those two DayColumn
// instances — not all seven, and not repeatedly.
test("default settings (all techniques ON): moving Monday → Wednesday re-renders only those two columns", async () => {
  render(<App />);
  await screen.findByText("Weekly insights");

  const mondayColumn = screen.getByTestId("day-column-0");
  const wednesdayColumn = screen.getByTestId("day-column-2");
  expect(within(mondayColumn).getByText("Design review")).toBeInTheDocument();

  expect(dayTaskCount("day-task-count-0")).toBe(3);
  expect(dayTaskCount("day-task-count-2")).toBe(3);

  dragEvent("event-evt-1", "day-column-2", "evt-1");

  expect(within(mondayColumn).queryByText("Design review")).not.toBeInTheDocument();
  expect(within(wednesdayColumn).getByText("Design review")).toBeInTheDocument();
  expect(dayTaskCount("day-task-count-0")).toBe(2);
  expect(dayTaskCount("day-task-count-2")).toBe(4);

  const counts = getCountsSnapshot();
  expect(counts.get("day-0")?.count).toBe(2); // mount + the move
  expect(counts.get("day-2")?.count).toBe(2); // mount + the move
  [1, 3, 4, 5, 6].forEach((untouchedDay) => {
    expect(counts.get(`day-${untouchedDay}`)?.count).toBe(1); // mount only
  });
});

// --- React.memo toggle -----------------------------------------------------
test("React.memo OFF: every day column re-renders on a move, not just the two affected", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("toggle-memoOn"));

  dragEvent("event-evt-1", "day-column-2", "evt-1");

  const counts = getCountsSnapshot();
  const values = [0, 1, 2, 3, 4, 5, 6].map((d) => counts.get(`day-${d}`)?.count);
  // Every column re-rendered the same number of times — no selectivity —
  // and the move itself still worked correctly.
  expect(values.every((v) => v === values[0])).toBe(true);
  expect(values[0]).toBeGreaterThan(1);

  expect(dayTaskCount("day-task-count-0")).toBe(2);
  expect(dayTaskCount("day-task-count-2")).toBe(4);
});

// --- useCallback toggle ------------------------------------------------
test("useCallback OFF (React.memo still ON): unstable handler props still force every column to re-render", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("toggle-useCallbackOn"));

  dragEvent("event-evt-1", "day-column-2", "evt-1");

  const counts = getCountsSnapshot();
  const values = [0, 1, 2, 3, 4, 5, 6].map((d) => counts.get(`day-${d}`)?.count);
  expect(values.every((v) => v === values[0])).toBe(true);
  expect(values[0]).toBeGreaterThan(1);

  expect(dayTaskCount("day-task-count-0")).toBe(2);
  expect(dayTaskCount("day-task-count-2")).toBe(4);
});

// --- useMemo toggle ------------------------------------------------------
test("useMemo OFF: events are still correctly sorted by time (functional, not just labeled)", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("toggle-useMemoOn"));

  // Friday (day 4) seed data is inserted out of time order: 09:30, 18:00,
  // 16:00 — sorting must still put it back in chronological order even
  // with the memoized computation bypassed.
  const fridayColumn = screen.getByTestId("day-column-4");
  const titles = within(fridayColumn)
    .getAllByTestId(/^event-/)
    .map((el) => el.textContent);

  const systemDesignIndex = titles.findIndex((t) => t.includes("System design"));
  const teamRetroIndex = titles.findIndex((t) => t.includes("Team retro"));
  const gymIndex = titles.findIndex((t) => t.includes("Gym"));

  expect(systemDesignIndex).toBeLessThan(teamRetroIndex);
  expect(teamRetroIndex).toBeLessThan(gymIndex);
});

// --- Everything together --------------------------------------------------
test("all three techniques can be switched off together and the calendar still works correctly", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("toggle-memoOn"));
  await user.click(screen.getByTestId("toggle-useCallbackOn"));
  await user.click(screen.getByTestId("toggle-useMemoOn"));

  ["memoOn", "useCallbackOn", "useMemoOn"].forEach((key) => {
    expect(screen.getByTestId(`toggle-${key}`)).toHaveTextContent(/OFF/);
  });
  expect(screen.getByTestId("weekly-insights")).toBeInTheDocument();

  const mondayColumn = screen.getByTestId("day-column-0");
  const wednesdayColumn = screen.getByTestId("day-column-2");
  expect(dayTaskCount("day-task-count-0")).toBe(3);
  expect(dayTaskCount("day-task-count-2")).toBe(3);

  dragEvent("event-evt-1", "day-column-2", "evt-1");

  expect(within(mondayColumn).queryByText("Design review")).not.toBeInTheDocument();
  expect(within(wednesdayColumn).getByText("Design review")).toBeInTheDocument();
  expect(dayTaskCount("day-task-count-0")).toBe(2);
  expect(dayTaskCount("day-task-count-2")).toBe(4);

  // Flip them all back on, and drag it right back — the task set stays
  // fully functional in either configuration. (Re-query the day columns
  // here: toggling memoOn swaps DayColumn's component type, which
  // genuinely remounts those DOM nodes, so the earlier references are
  // stale by this point — that's real, correct React behavior, not a bug.)
  await user.click(screen.getByTestId("toggle-memoOn"));
  await user.click(screen.getByTestId("toggle-useCallbackOn"));
  await user.click(screen.getByTestId("toggle-useMemoOn"));

  dragEvent("event-evt-1", "day-column-0", "evt-1");
  expect(within(screen.getByTestId("day-column-0")).getByText("Design review")).toBeInTheDocument();
  expect(
    within(screen.getByTestId("day-column-2")).queryByText("Design review")
  ).not.toBeInTheDocument();
});

// --- Add ------------------------------------------------------------
test("creating a task via a day's + add task button adds it to that day", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  const tuesdayColumn = screen.getByTestId("day-column-1");
  expect(within(tuesdayColumn).queryByText("Portfolio review")).not.toBeInTheDocument();
  expect(dayTaskCount("day-task-count-1")).toBe(2);

  await user.click(screen.getByTestId("add-task-1"));

  const modal = await screen.findByTestId("add-task-modal");
  await user.type(within(modal).getByLabelText(/title/i), "Portfolio review");
  await user.clear(within(modal).getByLabelText(/time/i));
  await user.type(within(modal).getByLabelText(/time/i), "13:00");
  await user.click(within(modal).getByRole("button", { name: /add task/i }));

  expect(screen.queryByTestId("add-task-modal")).not.toBeInTheDocument();
  expect(within(tuesdayColumn).getByText("Portfolio review")).toBeInTheDocument();
  expect(dayTaskCount("day-task-count-1")).toBe(3);
});

test("the toolbar's + new task button opens the modal for today (or Monday if today isn't in view)", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByText("+ new task"));
  expect(await screen.findByTestId("add-task-modal")).toBeInTheDocument();
});

test("adding a task only re-renders the day it was added to", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("add-task-4")); // Friday
  const modal = await screen.findByTestId("add-task-modal");
  await user.type(within(modal).getByLabelText(/title/i), "New Friday task");
  await user.click(within(modal).getByRole("button", { name: /add task/i }));

  const counts = getCountsSnapshot();
  expect(counts.get("day-4")?.count).toBe(2); // mount + the add
  [0, 1, 2, 3, 5, 6].forEach((untouchedDay) => {
    expect(counts.get(`day-${untouchedDay}`)?.count).toBe(1); // untouched
  });
});

// --- Delete ----------------------------------------------------------------
test("deleting a task via its hover delete button removes it from the calendar", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  expect(screen.getByText("Design review")).toBeInTheDocument();
  expect(dayTaskCount("day-task-count-0")).toBe(3);

  await user.click(screen.getByTestId("delete-evt-1"));

  expect(screen.queryByText("Design review")).not.toBeInTheDocument();
  expect(screen.queryByTestId("event-evt-1")).not.toBeInTheDocument();
  expect(dayTaskCount("day-task-count-0")).toBe(2);
});

test("deleting a task only re-renders the day it was removed from", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("delete-evt-1")); // Monday

  const counts = getCountsSnapshot();
  expect(counts.get("day-0")?.count).toBe(2); // mount + the delete
  [1, 2, 3, 4, 5, 6].forEach((untouchedDay) => {
    expect(counts.get(`day-${untouchedDay}`)?.count).toBe(1); // untouched
  });
});

test("deleting a task does not start a drag (delete button click is isolated from drag handling)", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Weekly insights");

  await user.click(screen.getByTestId("delete-evt-4")); // Gym — Push day, Tuesday

  expect(screen.queryByText("Gym — Push day")).not.toBeInTheDocument();
  // Nothing should have moved to another day as a side effect.
  const otherColumns = [0, 2, 3, 4, 5, 6].map((d) => screen.getByTestId(`day-column-${d}`));
  otherColumns.forEach((col) => {
    expect(within(col).queryByText("Gym — Push day")).not.toBeInTheDocument();
  });
});
