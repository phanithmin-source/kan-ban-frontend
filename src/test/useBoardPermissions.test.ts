import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBoardPermissions } from "../hooks/useBoardPermissions";

describe("useBoardPermissions hook", () => {
  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: "USER",
  };

  const mockBoard = {
    id: "board-1",
    name: "Development Board",
    isArchived: false,
    createdAt: "2026-07-10T00:00:00Z",
    updatedAt: "2026-07-10T00:00:00Z",
    owner: {
      id: "user-999",
      name: "Owner Name",
      email: "owner@example.com",
    },
    members: [
      {
        id: "member-1",
        role: "MEMBER" as const,
        user: {
          id: "user-123",
          name: "John Doe",
          email: "john@example.com",
        },
      },
    ],
  };

  it("should return false permission and undefined roles if board or user is missing", () => {
    const { result } = renderHook(() => useBoardPermissions(null, null));
    expect(result.current.canEditTasks).toBe(false);
    expect(result.current.canManageBoard).toBe(false);
    expect(result.current.isBoardOwner).toBe(false);
    expect(result.current.userBoardRole).toBeUndefined();
  });

  it("should determine permissions for a MEMBER of the board", () => {
    const { result } = renderHook(() => useBoardPermissions(mockBoard, mockUser));
    expect(result.current.currentMember?.role).toBe("MEMBER");
    expect(result.current.userBoardRole).toBe("MEMBER");
    expect(result.current.canEditTasks).toBe(true);
    expect(result.current.canManageBoard).toBe(false);
    expect(result.current.isBoardOwner).toBe(false);
  });

  it("should grant all permissions to ADMIN regardless of board membership", () => {
    const adminUser = { ...mockUser, role: "ADMIN" };
    // Board where admin is not a member and not owner
    const boardWithoutAdmin = {
      ...mockBoard,
      members: [],
    };
    const { result } = renderHook(() => useBoardPermissions(boardWithoutAdmin, adminUser));
    expect(result.current.canEditTasks).toBe(true);
    expect(result.current.canManageBoard).toBe(true);
    expect(result.current.isBoardOwner).toBe(true);
  });

  it("should allow board OWNER to manage board and edit tasks", () => {
    const ownerMemberBoard = {
      ...mockBoard,
      members: [
        {
          id: "member-owner",
          role: "OWNER" as const,
          user: {
            id: "user-123",
            name: "John Doe",
            email: "john@example.com",
          },
        },
      ],
    };
    const { result } = renderHook(() => useBoardPermissions(ownerMemberBoard, mockUser));
    expect(result.current.userBoardRole).toBe("OWNER");
    expect(result.current.canEditTasks).toBe(true);
    expect(result.current.canManageBoard).toBe(true);
    expect(result.current.isBoardOwner).toBe(true);
  });

  it("should identify board owner by owner id even if not in members list", () => {
    const boardWithSpecificOwner = {
      ...mockBoard,
      owner: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      },
      members: [], // User is not listed in members but is owner
    };
    const { result } = renderHook(() => useBoardPermissions(boardWithSpecificOwner, mockUser));
    expect(result.current.canManageBoard).toBe(true);
  });
});
