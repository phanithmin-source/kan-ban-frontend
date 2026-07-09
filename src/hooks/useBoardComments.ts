import { type Task } from "../types/task";

interface UseBoardCommentsProps {
  activeTask: Task | null;
  commentInput: string;
  setCommentInput: (val: string) => void;
  editingCommentText: string;
  setEditingCommentId: (id: string | null) => void;
  commentToDelete: string | null;
  setCommentToDelete: (id: string | null) => void;
  addComment: (taskId: string, content: string) => Promise<unknown>;
  updateComment: (commentId: string, content: string) => Promise<unknown>;
  deleteComment: (commentId: string) => Promise<unknown>;
}

export function useBoardComments({
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
}: UseBoardCommentsProps) {
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !commentInput.trim()) return;
    await addComment(activeTask.id, commentInput);
    setCommentInput("");
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    await updateComment(commentId, editingCommentText);
    setEditingCommentId(null);
  };

  const handleDeleteCommentClick = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    await deleteComment(commentToDelete);
    setCommentToDelete(null);
  };

  return {
    handlePostComment,
    handleSaveEditComment,
    handleDeleteCommentClick,
    handleConfirmDeleteComment,
  };
}
