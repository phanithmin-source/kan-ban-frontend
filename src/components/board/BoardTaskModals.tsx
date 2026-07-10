import { TaskDetailsModal } from "../task";
import BoardActionModals from "./BoardActionModals";
import BoardMembersModal from "./BoardMembersModal";
import { ConfirmationDialog } from "../ui";
import { type Task, type TaskStatus } from "../../types/task";
import { type BoardQuery, type GetUsersQuery, type TaskQuery } from "../../gql/graphql";
import { type AuthUser } from "../../context/AuthContext";
import { type BoardModalType } from "../../hooks/useBoardPageState";

interface BoardTaskModalsProps {
  board: BoardQuery["board"];
  users: GetUsersQuery["users"];
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  taskDetailsData: TaskQuery | undefined;
  canEditTasks: boolean;
  canManageBoard: boolean;
  userBoardRole?: string;
  user: AuthUser | null;

  // Comments state/handlers
  commentInput: string;
  setCommentInput: (val: string) => void;
  onPostComment: (e: React.FormEvent) => void | Promise<void>;
  editingCommentId: string | null;
  setEditingCommentId: (val: string | null) => void;
  editingCommentText: string;
  setEditingCommentText: (val: string) => void;
  onSaveEditComment: (commentId: string) => void | Promise<void>;
  onDeleteComment: (commentId: string) => void;

  // Board actions modal
  boardModal: BoardModalType;
  setBoardModal: (modal: BoardModalType) => void;
  boardModalInputRef: React.RefObject<HTMLInputElement | null>;
  boardModalInput: string;
  setBoardModalInput: (input: string) => void;
  onBoardModalConfirm: () => Promise<void>;

  // Members modal
  membersModalOpen: boolean;
  setMembersModalOpen: (open: boolean) => void;
  inviteUserId: string;
  setInviteUserId: (userId: string) => void;
  inviteRole: "MEMBER" | "VIEWER";
  setInviteRole: (role: "MEMBER" | "VIEWER") => void;
  onInvite: () => Promise<void>;
  onUpdateMemberRole: (userId: string, role: "MEMBER" | "VIEWER") => Promise<unknown>;
  onRemoveMember: (userId: string) => Promise<unknown>;

  // Confirm archive / delete comment
  taskToArchive: string | null;
  setTaskToArchive: (id: string | null) => void;
  onConfirmArchive: () => Promise<void>;
  commentToDelete: string | null;
  setCommentToDelete: (id: string | null) => void;
  onConfirmDeleteComment: () => Promise<void>;

  // Hooks callbacks
  onAssignTask: (taskId: string, userId: string, selectedMemberUser: Task["assignee"]) => void | Promise<unknown>;
  onChangeTaskStatus: (task: Task, status: TaskStatus) => Promise<unknown>;
  onUpdateTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">) => Promise<void>;
  onArchiveTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export default function BoardTaskModals({
  board,
  users,
  activeTask,
  setActiveTask,
  editingTask,
  setEditingTask,
  taskDetailsData,
  canEditTasks,
  canManageBoard,
  userBoardRole,
  user,
  commentInput,
  setCommentInput,
  onPostComment,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  onSaveEditComment,
  onDeleteComment,
  boardModal,
  setBoardModal,
  boardModalInputRef,
  boardModalInput,
  setBoardModalInput,
  onBoardModalConfirm,
  membersModalOpen,
  setMembersModalOpen,
  inviteUserId,
  setInviteUserId,
  inviteRole,
  setInviteRole,
  onInvite,
  onUpdateMemberRole,
  onRemoveMember,
  taskToArchive,
  setTaskToArchive,
  onConfirmArchive,
  commentToDelete,
  setCommentToDelete,
  onConfirmDeleteComment,
  onAssignTask,
  onChangeTaskStatus,
  onUpdateTask,
  onArchiveTask,
  onDeleteTask,
}: BoardTaskModalsProps) {
  return (
    <>
      {activeTask && (
        <TaskDetailsModal
          activeTask={(taskDetailsData?.task as Task) || activeTask}
          setActiveTask={setActiveTask}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          canEditTasks={canEditTasks}
          canManageBoard={canManageBoard}
          userBoardRole={userBoardRole}
          userGlobalRole={user?.role}
          currentUserId={user?.id}
          boardMembers={board?.members ?? []}
          onAssignTask={onAssignTask}
          onChangeTaskStatus={onChangeTaskStatus}
          onUpdateTask={onUpdateTask}
          onArchiveTask={onArchiveTask}
          onDeleteTask={onDeleteTask}
          commentInput={commentInput}
          setCommentInput={setCommentInput}
          onPostComment={onPostComment}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentText={setEditingCommentText}
          onSaveEditComment={onSaveEditComment}
          onDeleteComment={onDeleteComment}
        />
      )}

      {/* Board Confirmation Modals */}
      <BoardActionModals
        boardModal={boardModal}
        setBoardModal={setBoardModal}
        boardName={board?.name}
        boardModalInputRef={boardModalInputRef}
        boardModalInput={boardModalInput}
        setBoardModalInput={setBoardModalInput}
        onConfirm={onBoardModalConfirm}
      />

      {/* Board Members Overlay Modal */}
      {board && (
        <BoardMembersModal
          isOpen={membersModalOpen}
          onClose={() => setMembersModalOpen(false)}
          board={board}
          users={users}
          inviteUserId={inviteUserId}
          setInviteUserId={setInviteUserId}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          onInvite={onInvite}
          onUpdateRole={onUpdateMemberRole}
          onRemoveMember={onRemoveMember}
          canManageBoard={canManageBoard}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!taskToArchive}
        onClose={() => setTaskToArchive(null)}
        onConfirm={onConfirmArchive}
        title="Archive task"
        description="Are you sure you want to archive this task? It will be hidden from the active board."
        confirmLabel="Archive"
        variant="warning"
      />

      <ConfirmationDialog
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={onConfirmDeleteComment}
        title="Delete comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
