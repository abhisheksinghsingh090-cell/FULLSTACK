import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { EventCard } from "../EventCard.jsx";

const sampleEvent = {
  id: "evt-test-1",
  title: "Meeting",
  time: "10:00",
  day: 0,
  tag: "work",
};

test("renders event title", () => {
  render(<EventCard event={sampleEvent} onDragStart={() => {}} onDragEnd={() => {}} />);
  expect(screen.getByText("Meeting")).toBeInTheDocument();
});

test("renders the event's time", () => {
  render(<EventCard event={sampleEvent} onDragStart={() => {}} onDragEnd={() => {}} />);
  expect(screen.getByText("10:00")).toBeInTheDocument();
});

test("applies a reduced-opacity lift directly to the DOM node on drag start", () => {
  render(<EventCard event={sampleEvent} onDragStart={() => {}} onDragEnd={() => {}} />);
  const card = screen.getByTestId("event-evt-test-1");

  expect(card.style.opacity).toBe("");
  fireEvent.dragStart(card);
  expect(card.style.opacity).toBe("0.4");
  fireEvent.dragEnd(card);
  expect(card.style.opacity).toBe("1");
});
