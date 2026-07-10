import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskForm from "../components/task/TaskForm";

describe("TaskForm validation", () => {
  it("should render initial values and elements correctly", () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save task/i })).toBeInTheDocument();
  });

  it("should show validation errors when title is less than 3 characters", async () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "ab" } });
    fireEvent.click(screen.getByRole("button", { name: /Save task/i }));

    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it("should call onSubmit with valid values when form is submitted", async () => {
    const mockOnSubmit = vi.fn();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/Title/i);
    const descTextarea = screen.getByLabelText(/Description/i);
    const statusSelect = screen.getByLabelText(/Status/i);
    const prioritySelect = screen.getByLabelText(/Priority/i);
    const dateInput = screen.getByLabelText(/Due date/i);

    fireEvent.change(titleInput, { target: { value: "Implement new features" } });
    fireEvent.change(descTextarea, { target: { value: "This is a detailed description" } });
    fireEvent.change(statusSelect, { target: { value: "IN_PROGRESS" } });
    fireEvent.change(prioritySelect, { target: { value: "HIGH" } });
    fireEvent.change(dateInput, { target: { value: "2026-07-20" } });

    fireEvent.click(screen.getByRole("button", { name: /Save task/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Implement new features",
        description: "This is a detailed description",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2026-07-20",
      });
    });
  });

  it("should call onCancel when cancel button is clicked", () => {
    const mockOnCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
