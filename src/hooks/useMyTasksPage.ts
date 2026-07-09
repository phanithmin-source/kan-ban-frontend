import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "./useAuth";
import { useTaskOperations } from "./useTaskOperations";
import { useComments } from "./useComments";
import { TasksDocument } from "../gql/graphql";
import { type Task, type TaskStatus, type TaskPriority } from "../types/task";

export function useMyTasksPage() {
    const { user } = useAuth();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>("ALL");

    // Confirmation dialog states
    const [taskToArchive, setTaskToArchive] = useState<string | null>(null);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    // Comments states
    const [commentInput, setCommentInput] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");

    const { data, loading, error, refetch } = useQuery(TasksDocument, {
        variables: {
            page: 1,
            limit: 100, // Fetch up to 100 tasks assigned to user's boards
            assigneeId: user?.id,
            search: search || undefined,
            status: statusFilter === "ALL" ? undefined : statusFilter,
            priority: priorityFilter === "ALL" ? undefined : priorityFilter,
        },
        skip: !user?.id,
    });

    // Directly use the server-filtered tasks list
    const myTasks = useMemo(() => {
        return (data?.tasks?.data ?? []) as unknown as Task[];
    }, [data]);

    const {
        updateTask,
        deleteTask,
        archiveTask,
        assignTask,
        changeTaskStatus,
    } = useTaskOperations({
        onSuccess: () => {
            void refetch();
        },
        onAssignSuccess: (assignee) => {
            if (activeTask) {
                setActiveTask({ ...activeTask, assignee });
            }
        },
    });

    const { addComment, updateComment, deleteComment } = useComments({
        onSuccess: async () => {
            const res = await refetch();
            const updatedTask = res.data?.tasks?.data?.find((t) => t.id === activeTask?.id);
            if (updatedTask) {
                setActiveTask(updatedTask as unknown as Task);
            }
        },
    });

    const handleUpdate = async (updatedData: Omit<
        Task,
        "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board"
    >) => {
        if (!activeTask) return;
        await updateTask(activeTask.id, updatedData);
    };

    const handleDelete = async (taskId: string) => {
        await deleteTask(taskId);
        setActiveTask(null);
    };

    const handleArchiveClick = (taskId: string) => {
        setTaskToArchive(taskId);
    };

    const handleConfirmArchive = async () => {
        if (!taskToArchive) return;
        await archiveTask(taskToArchive);
        setActiveTask(null);
        setTaskToArchive(null);
    };

    const handleDeleteCommentClick = (commentId: string) => {
        setCommentToDelete(commentId);
    };

    const handleConfirmDeleteComment = async () => {
        if (!commentToDelete) return;
        await deleteComment(commentToDelete);
        setCommentToDelete(null);
    };

    const getStatusBadgeVariant = (status: TaskStatus) => {
        switch (status) {
            case "DONE":
                return "success";
            case "REVIEW":
                return "warning";
            case "IN_PROGRESS":
                return "info";
            default:
                return "secondary";
        }
    };

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return "destructive";
            case "MEDIUM":
                return "warning";
            default:
                return "success";
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !activeTask) return;
        await addComment(activeTask.id, commentInput);
        setCommentInput("");
    };

    const handleSaveEditComment = async (commentId: string) => {
        if (!editingCommentText.trim()) return;
        await updateComment(commentId, editingCommentText);
        setEditingCommentId(null);
    };

    return {
        user,
        activeTask,
        setActiveTask,
        editingTask,
        setEditingTask,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        taskToArchive,
        setTaskToArchive,
        commentToDelete,
        setCommentToDelete,
        commentInput,
        setCommentInput,
        editingCommentId,
        setEditingCommentId,
        editingCommentText,
        setEditingCommentText,
        loading,
        error,
        myTasks,
        assignTask,
        changeTaskStatus,
        handleUpdate,
        handleDelete,
        handleArchiveClick,
        handleConfirmArchive,
        handleDeleteCommentClick,
        handleConfirmDeleteComment,
        getStatusBadgeVariant,
        getPriorityBadgeVariant,
        handlePostComment,
        handleSaveEditComment,
    };
}
