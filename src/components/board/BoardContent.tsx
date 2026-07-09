import { TaskForm } from "../task";
import BoardKanbanView from "./BoardKanbanView";
import BoardListView from "./BoardListView";
import { type Task, type TaskStatus } from "../../types/task";
import { STATUS_ORDER, COLUMNS } from "../../lib/taskConstants";

import { type DragEndEvent } from "@dnd-kit/core";
import { type TasksQuery } from "../../gql/graphql";

interface BoardContentProps {
  viewMode: "BOARD" | "LIST";
  isCreating: boolean;
  setIsCreating: (val: boolean) => void;
  creatingTask: boolean;
  handleCreate: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
  optimisticTasks: Task[];
  tasksByColumn: Record<TaskStatus, Task[]>;
  canEditTasks: boolean;
  isBoardOwner: boolean;
  currentUserId?: string;
  setActiveTask: (task: Task | null) => void;
  setEditingTask: (task: Task | null) => void;
  handleDragEnd: (e: DragEndEvent) => void;
  changeTaskStatus: (task: Task, status: TaskStatus) => Promise<unknown>;
  refetch: () => Promise<unknown>;
  setSearch: (val: string) => void;
  setPriorityFilter: (val: "ALL" | Task["priority"]) => void;
  
  // List View specific props
  listLoading: boolean;
  listError: Error | undefined;
  listData: TasksQuery | undefined;
  currentPage: number;
  limitPerPage: number;
  setCurrentPage: (val: number) => void;
  refetchList: () => Promise<unknown>;
}

export default function BoardContent({
  viewMode,
  isCreating,
  setIsCreating,
  creatingTask,
  handleCreate,
  loading,
  error,
  optimisticTasks,
  tasksByColumn,
  canEditTasks,
  isBoardOwner,
  currentUserId,
  setActiveTask,
  setEditingTask,
  handleDragEnd,
  changeTaskStatus,
  refetch,
  setSearch,
  setPriorityFilter,
  listLoading,
  listError,
  listData,
  currentPage,
  limitPerPage,
  setCurrentPage,
  refetchList,
}: BoardContentProps) {
  return (
    <>
      {isCreating && (
        <div className="mb-8">
          <TaskForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          {creatingTask ? <p className="mt-4 text-sm text-slate-600">Creating task…</p> : null}
        </div>
      )}

      {viewMode === "BOARD" ? (
        <BoardKanbanView
          loading={loading}
          error={error}
          filteredTasks={optimisticTasks}
          tasksByColumn={tasksByColumn}
          columns={COLUMNS}
          statusOrder={STATUS_ORDER}
          canEditTasks={canEditTasks}
          isBoardOwner={isBoardOwner}
          currentUserId={currentUserId}
          setActiveTask={setActiveTask}
          setEditingTask={setEditingTask}
          handleDragEnd={handleDragEnd}
          changeTaskStatus={changeTaskStatus}
          refetch={refetch}
          clearFilters={() => {
            setSearch("");
            setPriorityFilter("ALL");
          }}
        />
      ) : (
        <BoardListView
          loading={listLoading}
          error={listError}
          listData={listData}
          currentPage={currentPage}
          limitPerPage={limitPerPage}
          onPageChange={setCurrentPage}
          setActiveTask={setActiveTask}
          refetchList={refetchList}
          clearFilters={() => {
            setSearch("");
            setPriorityFilter("ALL");
          }}
        />
      )}
    </>
  );
}
