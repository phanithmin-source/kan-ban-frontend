import { useMemo } from "react";
import type { BoardQuery } from "../gql/graphql";

type BoardType = NonNullable<BoardQuery["board"]>;

export function useBoardPermissions(
  board: BoardType | null | undefined,
  user: { id: string; name: string; email: string; role: string } | null | undefined
) {
  return useMemo(() => {
    if (!board || !user) {
      return {
        currentMember: undefined,
        userBoardRole: undefined,
        isViewer: false,
        canEditTasks: false,
        canManageBoard: false,
        isBoardOwner: false,
      };
    }

    const currentMember = board.members?.find(
      (m) => String(m.user.id) === String(user.id)
    );
    const userBoardRole = currentMember?.role;

    // VIEWER board role is explicitly read-only — they cannot create, edit, or move tasks
    const isViewer = userBoardRole === "VIEWER";

    const canEditTasks =
      user.role === "ADMIN" ||
      userBoardRole === "OWNER" ||
      userBoardRole === "MEMBER"; // VIEWER intentionally excluded

    const canManageBoard =
      user.role === "ADMIN" ||
      userBoardRole === "OWNER" ||
      !!(board.owner?.id && String(board.owner.id) === String(user.id));

    const isBoardOwner = user.role === "ADMIN" || userBoardRole === "OWNER";

    return {
      currentMember,
      userBoardRole,
      isViewer,
      canEditTasks,
      canManageBoard,
      isBoardOwner,
    };
  }, [board, user]);
}
