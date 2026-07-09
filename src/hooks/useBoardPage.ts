import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import {
  useBoard,
  useAuth,
  useBoardPermissions,
  useBoardOperations,
  useTaskOperations,
  useComments,
  useBoardPageState,
  useBoardTasks,
  useBoardMutations,
  useBoardComments,
} from "./index";

import { BoardsDocument, TasksDocument, GetUsersDocument, TaskDocument } from "../gql/graphql";

export function useBoardPage(boardId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── UI state ────────────────────────────────────────────────────────────────
  const state = useBoardPageState();
  const {
    search,
    priorityFilter,
    currentPage,
    limitPerPage,
    activeTask,
    setActiveTask,
    taskToArchive,
    setTaskToArchive,
    commentInput,
    setCommentInput,
    editingCommentText,
    setEditingCommentId,
    commentToDelete,
    setCommentToDelete,
    boardModal,
    setBoardModal,
    boardModalInput,
    setBoardModalInput,
    inviteUserId,
    setInviteUserId,
    inviteRole,
  } = state;

  const boardModalInputRef = useRef<HTMLInputElement>(null);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: boardsData, loading: boardsLoading, error: boardsError } = useQuery(BoardsDocument);
  const { board, loading, error, refetch } = useBoard(boardId);
  const { data: usersData } = useQuery(GetUsersDocument);

  const { data: taskDetailsData, refetch: refetchTaskDetails } = useQuery(TaskDocument, {
    variables: { id: activeTask?.id ?? "" },
    skip: !activeTask?.id,
  });

  const {
    data: listData,
    loading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery(TasksDocument, {
    variables: {
      page: currentPage,
      limit: limitPerPage,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
    },
    skip: !boardId,
  });

  // ── Permissions ──────────────────────────────────────────────────────────────
  const { canEditTasks, canManageBoard, isBoardOwner, userBoardRole } = useBoardPermissions(board, user);

  // ── Operational hooks ────────────────────────────────────────────────────────
  const {
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
    addBoardMember,
    updateBoardMemberRole,
    removeBoardMember,
  } = useBoardOperations(boardId);

  const {
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    assignTask,
    changeTaskStatus,
    creatingTask,
  } = useTaskOperations({
    boardId,
    onSuccess: () => {
      void refetch();
      void refetchList();
      void refetchKanbanTasks();
    },
    onAssignSuccess: (assignee) => {
      void refetchTaskDetails();
      if (activeTask) setActiveTask({ ...activeTask, assignee });
    },
  });

  const { addComment, updateComment, deleteComment } = useComments({
    onSuccess: async () => {
      void refetchTaskDetails();
      void refetchList();
      void refetchKanbanTasks();
    },
  });

  // ── Kanban drag-and-drop ─────────────────────────────────────────────────────
  const {
    optimisticTasks,
    tasksByColumn,
    handleDragEnd,
    kanbanTasksLoading,
    kanbanTasksError,
    refetchKanbanTasks,
  } = useBoardTasks({ boardId, search, priorityFilter, canEditTasks, changeTaskStatus });

  // ── Mutation wrappers ────────────────────────────────────────────────────────
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchiveClick,
    handleConfirmArchive,
    handleCreateBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleBoardModalConfirm,
  } = useBoardMutations({
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
  });

  // ── Comment handlers ─────────────────────────────────────────────────────────
  const {
    handlePostComment,
    handleSaveEditComment,
    handleDeleteCommentClick,
    handleConfirmDeleteComment,
  } = useBoardComments({
    activeTask,
    commentInput,
    setCommentInput,
    editingCommentText,
    setEditingCommentId,
    commentToDelete,
    setCommentToDelete,
    addComment,
    updateComment,
    deleteComment,
  });

  // ── Board redirect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!boardId && boardsData?.boards && boardsData.boards.length > 0) {
      const activeBoards = boardsData.boards.filter((b) => !b.isArchived);
      if (activeBoards.length > 0) navigate(`/board/${activeBoards[0].id}`, { replace: true });
    }
  }, [boardId, boardsData, navigate]);

  // ── Derived invite handler ───────────────────────────────────────────────────
  const handleInviteMember = async () => {
    if (!inviteUserId) return;
    await addBoardMember(inviteUserId, inviteRole);
    setInviteUserId("");
  };

  return {
    // router
    navigate,
    // auth
    user,
    // board data
    board,
    boardsData,
    usersData,
    boardsLoading,
    boardsError,
    // task details (lazy)
    taskDetailsData,
    // kanban data
    optimisticTasks,
    tasksByColumn,
    handleDragEnd,
    kanbanTasksLoading,
    kanbanTasksError,
    // list view data
    listData,
    listLoading,
    listError,
    refetchList,
    // loading / error states
    loading,
    error,
    refetch,
    // permissions
    canEditTasks,
    canManageBoard,
    isBoardOwner,
    userBoardRole,
    // member actions
    updateBoardMemberRole,
    removeBoardMember,
    handleInviteMember,
    // task actions
    creatingTask,
    assignTask,
    changeTaskStatus,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchiveClick,
    handleConfirmArchive,
    // board actions
    handleCreateBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleBoardModalConfirm,
    // comment actions
    handlePostComment,
    handleSaveEditComment,
    handleDeleteCommentClick,
    handleConfirmDeleteComment,
    // full state bag (passed straight to components)
    state,
    boardModalInputRef,
  };
}
