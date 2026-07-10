import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import {
    GetUsersDocument,
    UpdateUserDocument,
    DeleteUserDocument,
    type GetUsersQuery,
} from "../gql/graphql";

// Form validation schema
export const editUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;

export interface TargetUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export function useUsersPage() {
    const { user: currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState<TargetUser | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-400";
            case "MANAGER":
                return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/25 dark:text-amber-400";
            default:
                return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400";
        }
    };

    const { data, loading, error } = useQuery(GetUsersDocument);

    const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument, {
        onCompleted: () => {
            toast.success("User updated successfully");
            setEditingUser(null);
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update user");
        },
    });

    const [deleteUser] = useMutation(DeleteUserDocument, {
        onCompleted: () => {
            toast.success("User deleted successfully");
        },
        update: (cache) => {
            if (userToDelete) {
                const existing = cache.readQuery<GetUsersQuery>({ query: GetUsersDocument });
                if (existing?.users) {
                    cache.writeQuery<GetUsersQuery>({
                        query: GetUsersDocument,
                        data: {
                            users: existing.users.filter((u) => u.id !== userToDelete),
                        },
                    });
                }
            }
        },
        onError: (err) => {
            toast.error(err.message || "Failed to delete user");
        },
    });

    // React hook form setup
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditUserFormData>({
        resolver: zodResolver(editUserSchema),
    });

    // Prefill form when opening edit modal
    const handleStartEdit = (user: TargetUser) => {
        setEditingUser(user);
        reset({
            name: user.name,
            email: user.email,
        });
    };

    const handleSave = async (formData: EditUserFormData) => {
        if (!editingUser) return;
        await updateUser({
            variables: {
                id: editingUser.id,
                input: formData,
            },
        });
    };

    const handleDeleteClick = (id: string) => {
        if (String(id) === String(currentUser?.id)) {
            toast.warning("You cannot delete your own admin account.");
            return;
        }
        setUserToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        await deleteUser({
            variables: { id: userToDelete },
        });
        setUserToDelete(null);
    };

    // Client-side search filtering
    const filteredUsers = useMemo(() => {
        const list = data?.users ?? [];
        if (!search.trim()) return list;

        const term = search.toLowerCase();
        return list.filter(
            (u) =>
                u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        );
    }, [data, search]);

    return {
        currentUser,
        search,
        setSearch,
        editingUser,
        setEditingUser,
        userToDelete,
        setUserToDelete,
        getRoleBadgeClass,
        loading,
        error,
        updating,
        register,
        handleSubmit: handleSubmit(handleSave),
        errors,
        handleStartEdit,
        handleDeleteClick,
        handleConfirmDelete,
        filteredUsers,
    };
}
