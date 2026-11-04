import { render, screen, within } from "@testing-library/react";
import { CalendarGrid } from "../CalendarGrid.jsx";

const weekDates = ["Aug 10", "Aug 11", "Aug 12", "Aug 13", "Aug 14", "Aug 15", "Aug 16"];

function buildEventsByDay() {
  const grid = Array.from({ length: 7 }, () => []);
  grid[0] = [{ id: "a", title: "Standup", time: "09:00", day: 0, tag: "work" }];
  grid[3] = [{ id: "b", title: "Gym", time: "18:00", day: 3, tag: "fitness" }];
  return grid;
}

test("renders all 7 days of the week", () => {
  render(
    <CalendarGrid
      weekDates={weekDates}
      eventsByDay={buildEventsByDay()}
      onDrop={() => {}}
      onDragStartEvent={() => {}}
      onDragEndEvent={() => {}}
      memoOn
      useMemoOn
      todayIndex={-1}
    />
  );

  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
    expect(screen.getByText(day)).toBeInTheDocument();
  });
});

test("places each event under its own day column, not any other", () => {
  render(
    <CalendarGrid
      weekDates={weekDates}
      eventsByDay={buildEventsByDay()}
      onDrop={() => {}}
      onDragStartEvent={() => {}}
      onDragEndEvent={() => {}}
      memoOn
      useMemoOn
      todayIndex={-1}
    />
  );

  const mondayColumn = screen.getByTestId("day-column-0");
  expect(within(mondayColumn).getByText("Standup")).toBeInTheDocument();
  expect(within(mondayColumn).queryByText("Gym")).not.toBeInTheDocument();

  const thursdayColumn = screen.getByTestId("day-column-3");
  expect(within(thursdayColumn).getByText("Gym")).toBeInTheDocument();
});

test("dropping on a column calls onDrop with that day's index", () => {
  const handleDrop = jest.fn();
  render(
    <CalendarGrid
      weekDates={weekDates}
      eventsByDay={buildEventsByDay()}
      onDrop={handleDrop}
      onDragStartEvent={() => {}}
      onDragEndEvent={() => {}}
      memoOn
      useMemoOn
      todayIndex={-1}
    />
  );

  const fridayColumn = screen.getByTestId("day-column-4");
  fridayColumn.dispatchEvent(new Event("drop", { bubbles: true, cancelable: true }));
  // jsdom's synthetic Event has no dataTransfer by default; the component
  // only reads `day` from the closure for onDrop, so a plain drop event is
  // enough to exercise the handler.
  expect(handleDrop).toHaveBeenCalledWith(4);
});

test("memoOn=false renders the unmemoized DayColumn/EventCard variants (still fully functional)", () => {
  render(
    <CalendarGrid
      weekDates={weekDates}
      eventsByDay={buildEventsByDay()}
      onDrop={() => {}}
      onDragStartEvent={() => {}}
      onDragEndEvent={() => {}}
      memoOn={false}
      useMemoOn
      todayIndex={-1}
    />
  );

  expect(screen.getByText("Standup")).toBeInTheDocument();
  expect(screen.getByText("Gym")).toBeInTheDocument();
});
