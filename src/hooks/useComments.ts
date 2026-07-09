import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import {
  AddCommentDocument,
  UpdateCommentDocument,
  DeleteCommentDocument,
} from "../gql/graphql";

interface UseCommentsProps {
  onSuccess?: () => void;
}

export function useComments({ onSuccess }: UseCommentsProps = {}) {
  const [addCommentMutation] = useMutation(AddCommentDocument, {
    onCompleted: () => {
      toast.success("Comment added");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add comment");
    },
  });

  const [updateCommentMutation] = useMutation(UpdateCommentDocument, {
    onCompleted: () => {
      toast.success("Comment updated");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update comment");
    },
  });

  const [deleteCommentMutation] = useMutation(DeleteCommentDocument, {
    onCompleted: () => {
      toast.success("Comment deleted");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete comment");
    },
  });

  const addComment = async (taskId: string, content: string) => {
    return addCommentMutation({ variables: { taskId, content } });
  };

  const updateComment = async (id: string, content: string) => {
    return updateCommentMutation({ variables: { id, content } });
  };

  const deleteComment = async (id: string) => {
    return deleteCommentMutation({ variables: { id } });
  };

  return {
    addComment,
    updateComment,
    deleteComment,
  };
}
