import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CreateBoardDocument,
  UpdateBoardDocument,
  DeleteBoardDocument,
  ArchiveBoardDocument,
  AddBoardMemberDocument,
  RemoveBoardMemberDocument,
  UpdateBoardMemberRoleDocument,
  BoardsDocument,
  BoardDocument,
} from "../gql/graphql";

export function useBoardOperations(boardId?: string) {
  const navigate = useNavigate();

  const [createBoardMutation] = useMutation(CreateBoardDocument, {
    onCompleted: (data) => {
      if (data?.createBoard) {
        toast.success("Board created successfully");
        navigate(`/board/${data.createBoard.id}`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [updateBoardMutation] = useMutation(UpdateBoardDocument, {
    onCompleted: () => {
      toast.success("Board renamed successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to rename board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [deleteBoardMutation] = useMutation(DeleteBoardDocument, {
    onCompleted: () => {
      toast.success("Board deleted successfully");
      navigate("/board");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [archiveBoardMutation] = useMutation(ArchiveBoardDocument, {
    onCompleted: () => {
      toast.success("Board archived successfully");
      navigate("/board");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to archive board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [addBoardMemberMutation] = useMutation(AddBoardMemberDocument, {
    onCompleted: () => {
      toast.success("Member added successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add member");
    },
    refetchQueries: boardId
      ? [{ query: BoardDocument, variables: { id: boardId } }]
      : [],
  });

  const [removeBoardMemberMutation] = useMutation(RemoveBoardMemberDocument, {
    onCompleted: () => {
      toast.success("Member removed successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove member");
    },
    refetchQueries: boardId
      ? [{ query: BoardDocument, variables: { id: boardId } }]
      : [],
  });

  const [updateBoardMemberRoleMutation] = useMutation(
    UpdateBoardMemberRoleDocument,
    {
      onCompleted: () => {
        toast.success("Member role updated successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update member role");
      },
      refetchQueries: boardId
        ? [{ query: BoardDocument, variables: { id: boardId } }]
        : [],
    }
  );

  const createBoard = async (name: string) => {
    return createBoardMutation({ variables: { input: { name } } });
  };

  const updateBoard = async (id: string, name: string) => {
    return updateBoardMutation({ variables: { id, input: { name } } });
  };

  const deleteBoard = async (id: string) => {
    return deleteBoardMutation({ variables: { id } });
  };

  const archiveBoard = async (id: string) => {
    return archiveBoardMutation({ variables: { id } });
  };

  const addBoardMember = async (userId: string, role: "MEMBER" | "VIEWER") => {
    if (!boardId) return;
    return addBoardMemberMutation({
      variables: { boardId, userId, role },
    });
  };

  const removeBoardMember = async (userId: string) => {
    if (!boardId) return;
    return removeBoardMemberMutation({
      variables: { boardId, userId },
    });
  };

  const updateBoardMemberRole = async (userId: string, role: "MEMBER" | "VIEWER") => {
    if (!boardId) return;
    return updateBoardMemberRoleMutation({
      variables: { boardId, userId, role },
    });
  };

  return {
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
    addBoardMember,
    removeBoardMember,
    updateBoardMemberRole,
  };
}
