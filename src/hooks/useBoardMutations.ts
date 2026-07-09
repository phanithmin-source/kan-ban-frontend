import { useNavigate } from "react-router-dom";
import { type Task } from "../types/task";
import { type BoardQuery } from "../gql/graphql";
import { type BoardModalType } from "./useBoardPageState";

interface UseBoardMutationsProps {
  boardId: string;
  board: BoardQuery["board"];
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  taskToArchive: string | null;
  setTaskToArchive: (taskId: string | null) => void;
  boardModal: BoardModalType;
  setBoardModal: (modal: BoardModalType) => void;
  boardModalInput: string;
  setBoardModalInput: (input: string) => void;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">) => Promise<unknown>;
  updateTask: (id: string, data: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">) => Promise<unknown>;
  deleteTask: (id: string) => Promise<unknown>;
  archiveTask: (id: string) => Promise<unknown>;
  createBoard: (name: string) => Promise<unknown>;
  updateBoard: (id: string, name: string) => Promise<unknown>;
  deleteBoard: (id: string) => Promise<unknown>;
  archiveBoard: (id: string) => Promise<unknown>;
}

export function useBoardMutations({
  boardId,
  board,
  activeTask,
  setActiveTask,
  taskToArchive,
  setTaskToArchive,
  boardModal,
  setBoardModal,
  boardModalInput,
  setBoardModalInput,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  createBoard,
  updateBoard,
  deleteBoard,
  archiveBoard,
}: UseBoardMutationsProps) {
  const navigate = useNavigate();

  const handleCreate = async (
    newTask: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">
  ) => {
    await createTask(newTask);
  };

  const handleUpdate = async (
    updatedData: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">
  ) => {
    if (!activeTask) return;
    await updateTask(activeTask.id, updatedData);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setActiveTask(null);
  };

  const handleArchiveClick = (taskId: string) => {
    setTaskToArchive(taskId);
  };

  const handleConfirmArchive = async () => {
    if (!taskToArchive) return;
    await archiveTask(taskToArchive);
    setActiveTask(null);
    setTaskToArchive(null);
  };

  const handleCreateBoard = () => {
    setBoardModalInput("");
    setBoardModal({ type: "create" });
  };

  const handleRenameBoard = () => {
    if (!board) return;
    setBoardModalInput(board.name);
    setBoardModal({ type: "rename", currentName: board.name });
  };

  const handleDeleteBoard = () => {
    setBoardModal({ type: "delete" });
  };

  const handleBoardModalConfirm = async () => {
    if (!boardModal) return;
    if (boardModal.type === "create") {
      if (!boardModalInput.trim()) return;
      await createBoard(boardModalInput);
    } else if (boardModal.type === "rename") {
      if (!boardModalInput.trim() || boardModalInput === boardModal.currentName) return;
      await updateBoard(boardId, boardModalInput);
    } else if (boardModal.type === "delete") {
      await deleteBoard(boardId);
      navigate("/dashboard");
    } else if (boardModal.type === "archive") {
      await archiveBoard(boardId);
      navigate("/dashboard");
    }
    setBoardModal(null);
    setBoardModalInput("");
  };

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchiveClick,
    handleConfirmArchive,
    handleCreateBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleBoardModalConfirm,
  };
}
