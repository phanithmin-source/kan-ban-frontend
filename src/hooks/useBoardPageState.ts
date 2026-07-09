import { useState } from "react";
import { type Task } from "../types/task";

export type BoardModalType =
  | { type: "create" }
  | { type: "rename"; currentName: string }
  | { type: "delete" }
  | { type: "archive" }
  | null;

export function useBoardPageState() {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST">("BOARD");
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  const [taskToArchive, setTaskToArchive] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "VIEWER">("MEMBER");

  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [boardModal, setBoardModal] = useState<BoardModalType>(null);
  const [boardModalInput, setBoardModalInput] = useState("");

  return {
    isCreating,
    setIsCreating,
    activeTask,
    setActiveTask,
    editingTask,
    setEditingTask,
    search,
    setSearch,
    priorityFilter,
    setPriorityFilter,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    limitPerPage,
    taskToArchive,
    setTaskToArchive,
    commentToDelete,
    setCommentToDelete,
    membersModalOpen,
    setMembersModalOpen,
    inviteUserId,
    setInviteUserId,
    inviteRole,
    setInviteRole,
    commentInput,
    setCommentInput,
    editingCommentId,
    setEditingCommentId,
    editingCommentText,
    setEditingCommentText,
    boardModal,
    setBoardModal,
    boardModalInput,
    setBoardModalInput,
  };
}
