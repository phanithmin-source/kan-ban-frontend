import type { RefObject } from "react";
import { Button } from "../common";
import { Input, Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui";
import { type BoardModalType } from "../../hooks/useBoardPageState";

interface BoardActionModalsProps {
  boardModal: BoardModalType;
  setBoardModal: (value: BoardModalType) => void;
  boardName?: string;
  boardModalInputRef: RefObject<HTMLInputElement | null>;
  boardModalInput: string;
  setBoardModalInput: (value: string) => void;
  onConfirm: () => void | Promise<void>;
}

export default function BoardActionModals({
  boardModal,
  setBoardModal,
  boardName,
  boardModalInputRef,
  boardModalInput,
  setBoardModalInput,
  onConfirm,
}: BoardActionModalsProps) {
  if (!boardModal) return null;

  const getBoardModalTitle = (type: typeof boardModal.type) => {
    switch (type) {
      case "create":
        return "Create new board";
      case "rename":
        return "Rename board";
      case "archive":
        return "Archive board";
      default:
        return "Delete board";
    }
  };

  return (
    <Dialog open={!!boardModal} onOpenChange={(open) => { if (!open) setBoardModal(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {getBoardModalTitle(boardModal.type)}
          </DialogTitle>
        </DialogHeader>

        {boardModal.type === "delete" ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{boardName}</span>? All
              tasks on this board will be permanently removed.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-danger/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-danger cursor-pointer"
              >
                Delete board
              </button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBoardModal(null)}
                className="flex-1 justify-center rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : boardModal.type === "archive" ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to archive{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{boardName}</span>? It
              will be removed from your active workspace.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 cursor-pointer"
              >
                Archive board
              </button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBoardModal(null)}
                className="flex-1 justify-center rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-2">
              <label
                htmlFor="board-modal-name"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Board name
              </label>
              <Input
                id="board-modal-name"
                ref={boardModalInputRef}
                type="text"
                value={boardModalInput}
                onChange={(e) => setBoardModalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void onConfirm();
                  if (e.key === "Escape") setBoardModal(null);
                }}
                placeholder="e.g. Q3 Roadmap"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="primary"
                onClick={onConfirm}
                disabled={!boardModalInput.trim()}
                className="flex-1 justify-center rounded-2xl"
              >
                {boardModal.type === "create" ? "Create" : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBoardModal(null)}
                className="flex-1 justify-center rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
