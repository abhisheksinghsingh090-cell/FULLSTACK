import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTaskModal } from "../AddTaskModal.jsx";

test("rejects an empty title instead of calling onCreate", async () => {
  const user = userEvent.setup();
  const onCreate = jest.fn();
  render(<AddTaskModal day={0} onCreate={onCreate} onClose={() => {}} />);

  await user.click(screen.getByRole("button", { name: /add task/i }));

  expect(onCreate).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent(/title/i);
});

test("submits a fully filled-out form with the day it was opened for", async () => {
  const user = userEvent.setup();
  const onCreate = jest.fn();
  render(<AddTaskModal day={1} onCreate={onCreate} onClose={() => {}} />);

  await user.type(screen.getByLabelText(/title/i), "Deep work block");
  await user.clear(screen.getByLabelText(/time/i));
  await user.type(screen.getByLabelText(/time/i), "14:30");
  await user.selectOptions(screen.getByLabelText(/tag/i), "study");

  await user.click(screen.getByRole("button", { name: /add task/i }));

  expect(onCreate).toHaveBeenCalledWith({
    title: "Deep work block",
    time: "14:30",
    tag: "study",
    day: 1,
  });
});

test("the day dropdown can be changed away from the day it was opened for", async () => {
  const user = userEvent.setup();
  const onCreate = jest.fn();
  render(<AddTaskModal day={0} onCreate={onCreate} onClose={() => {}} />);

  await user.type(screen.getByLabelText(/title/i), "Portfolio review");
  await user.selectOptions(screen.getByLabelText(/day/i), "5");
  await user.click(screen.getByRole("button", { name: /add task/i }));

  expect(onCreate).toHaveBeenCalledWith(
    expect.objectContaining({ title: "Portfolio review", day: 5 })
  );
});

test("clicking the backdrop or Cancel closes without creating anything", async () => {
  const user = userEvent.setup();
  const onClose = jest.fn();
  const onCreate = jest.fn();
  render(<AddTaskModal day={0} onCreate={onCreate} onClose={onClose} />);

  await user.click(screen.getByRole("button", { name: /cancel/i }));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onCreate).not.toHaveBeenCalled();
});

test("Escape key closes the modal", () => {
  const onClose = jest.fn();
  render(<AddTaskModal day={0} onCreate={() => {}} onClose={onClose} />);

  screen.getByTestId("add-task-modal").ownerDocument.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});
