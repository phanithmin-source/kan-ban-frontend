import {
  BoardEmptyState,
  BoardHeader,
  BoardSelector,
  TaskFilterBar,
  BoardContent,
  BoardTaskModals,
} from "@/components";
import { useBoardPage } from "../../hooks";

export default function Board({ boardId }: { boardId: string }) {
  const {
    navigate,
    user,
    board,
    boardsData,
    usersData,
    boardsLoading,
    boardsError,
    taskDetailsData,
    optimisticTasks,
    tasksByColumn,
    handleDragEnd,
    kanbanTasksLoading,
    kanbanTasksError,
    listData,
    listLoading,
    listError,
    refetchList,
    loading,
    error,
    refetch,
    canEditTasks,
    canManageBoard,
    isBoardOwner,
    userBoardRole,
    updateBoardMemberRole,
    removeBoardMember,
    handleInviteMember,
    creatingTask,
    assignTask,
    changeTaskStatus,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchiveClick,
    handleConfirmArchive,
    handleCreateBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleBoardModalConfirm,
    handlePostComment,
    handleSaveEditComment,
    handleDeleteCommentClick,
    handleConfirmDeleteComment,
    state,
    boardModalInputRef,
  } = useBoardPage(boardId);

  const {
    isCreating, setIsCreating,
    activeTask, setActiveTask,
    editingTask, setEditingTask,
    search, setSearch,
    priorityFilter, setPriorityFilter,
    viewMode, setViewMode,
    currentPage, setCurrentPage,
    limitPerPage,
    taskToArchive, setTaskToArchive,
    commentToDelete, setCommentToDelete,
    membersModalOpen, setMembersModalOpen,
    inviteUserId, setInviteUserId,
    inviteRole, setInviteRole,
    commentInput, setCommentInput,
    editingCommentId, setEditingCommentId,
    editingCommentText, setEditingCommentText,
    boardModal, setBoardModal,
    boardModalInput, setBoardModalInput,
  } = state;

  if (!boardId) {
    return (
      <BoardEmptyState
        boardsLoading={boardsLoading}
        boardsError={boardsError}
        user={user}
        onCreateBoard={handleCreateBoard}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <BoardSelector
        boards={boardsData?.boards ?? []}
        boardId={boardId}
        onSelectBoard={(val) => {
          if (val === "CREATE_NEW") handleCreateBoard();
          else navigate(`/board/${val}`);
        }}
        onRenameBoard={handleRenameBoard}
        onArchiveBoard={() => setBoardModal({ type: "archive" })}
        onDeleteBoard={handleDeleteBoard}
        onManageMembers={() => setMembersModalOpen(true)}
        canManageBoard={canManageBoard}
        hasMembersAccess={!!(userBoardRole || user?.role === "ADMIN")}
        boardOwnerName={board?.owner?.name}
        canCreateBoard={user?.role === "ADMIN" || user?.role === "MANAGER"}
      />

      {board && (
        <BoardHeader
          boardName={board.name}
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          setEditingTask={setEditingTask}
          setActiveTask={setActiveTask}
          canEditTasks={canEditTasks}
        />
      )}

      <TaskFilterBar
        search={search}
        setSearch={setSearch}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        resultsCount={viewMode === "BOARD" ? optimisticTasks.length : listData?.tasks.total ?? 0}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <BoardContent
        viewMode={viewMode}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        creatingTask={creatingTask}
        handleCreate={handleCreate}
        loading={loading || kanbanTasksLoading}
        error={error || kanbanTasksError}
        optimisticTasks={optimisticTasks}
        tasksByColumn={tasksByColumn}
        canEditTasks={canEditTasks}
        isBoardOwner={isBoardOwner}
        currentUserId={user?.role === "USER" ? user.id : undefined}
        setActiveTask={setActiveTask}
        setEditingTask={setEditingTask}
        handleDragEnd={handleDragEnd}
        changeTaskStatus={changeTaskStatus}
        refetch={refetch}
        setSearch={setSearch}
        setPriorityFilter={setPriorityFilter}
        listLoading={listLoading}
        listError={listError}
        listData={listData}
        currentPage={currentPage}
        limitPerPage={limitPerPage}
        setCurrentPage={setCurrentPage}
        refetchList={refetchList}
      />

      <BoardTaskModals
        board={board}
        users={usersData?.users ?? []}
        activeTask={activeTask}
        setActiveTask={setActiveTask}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        taskDetailsData={taskDetailsData}
        canEditTasks={canEditTasks}
        canManageBoard={canManageBoard}
        userBoardRole={userBoardRole}
        user={user}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        onPostComment={handlePostComment}
        editingCommentId={editingCommentId}
        setEditingCommentId={setEditingCommentId}
        editingCommentText={editingCommentText}
        setEditingCommentText={setEditingCommentText}
        onSaveEditComment={handleSaveEditComment}
        onDeleteComment={handleDeleteCommentClick}
        boardModal={boardModal}
        setBoardModal={setBoardModal}
        boardModalInputRef={boardModalInputRef}
        boardModalInput={boardModalInput}
        setBoardModalInput={setBoardModalInput}
        onBoardModalConfirm={handleBoardModalConfirm}
        membersModalOpen={membersModalOpen}
        setMembersModalOpen={setMembersModalOpen}
        inviteUserId={inviteUserId}
        setInviteUserId={setInviteUserId}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
        onInvite={handleInviteMember}
        onUpdateMemberRole={updateBoardMemberRole}
        onRemoveMember={removeBoardMember}
        taskToArchive={taskToArchive}
        setTaskToArchive={setTaskToArchive}
        onConfirmArchive={handleConfirmArchive}
        commentToDelete={commentToDelete}
        setCommentToDelete={setCommentToDelete}
        onConfirmDeleteComment={handleConfirmDeleteComment}
        onAssignTask={assignTask}
        onChangeTaskStatus={changeTaskStatus}
        onUpdateTask={handleUpdate}
        onArchiveTask={handleArchiveClick}
        onDeleteTask={handleDelete}
      />
    </div>
  );
}
