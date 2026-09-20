import React from "react";
import { DayColumn, DayColumnUnoptimized } from "./DayColumn.jsx";
import { DAY_NAMES } from "../data/initialEvents.js";

export function CalendarGrid({
  weekDates,
  eventsByDay,
  onDrop,
  onDragStartEvent,
  onDragEndEvent,
  onAddTask,
  onDeleteTask,
  memoOn,
  useMemoOn,
  todayIndex,
}) {
  const Column = memoOn ? DayColumn : DayColumnUnoptimized;

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-7">
      {DAY_NAMES.map((dayName, day) => (
        <Column
          key={day}
          day={day}
          dayName={dayName}
          dateLabel={weekDates[day]}
          isToday={day === todayIndex}
          events={eventsByDay[day]}
          onDrop={onDrop}
          onDragStartEvent={onDragStartEvent}
          onDragEndEvent={onDragEndEvent}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
          memoOn={memoOn}
          useMemoOn={useMemoOn}
        />
      ))}
    </div>
  );
}
