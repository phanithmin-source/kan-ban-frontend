import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { useAuth } from "./useAuth";
import { UpdateUserDocument, UserFieldsFragmentDoc } from "../gql/graphql";
import { useFragment } from "../gql/fragment-masking";
import { toast } from "sonner";

export const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export function useProfilePage() {
    const { user, updateUser: updateUserContext } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const userRole = useMemo(() => {
        if (!user) return "Guest";
        switch (user.role) {
            case "ADMIN":
                return "Administrator";
            case "MANAGER":
                return "Manager";
            default:
                return "User";
        }
    }, [user]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
        },
    });

    const [updateUser] = useMutation(UpdateUserDocument);

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;
        setServerError(null);
        try {
            const { data: resData } = await updateUser({
                variables: { id: user.id, input: data },
            });
            if (resData?.updateUser) {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const unmasked = useFragment(UserFieldsFragmentDoc, resData.updateUser);
                updateUserContext(unmasked);
            }
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Update failed";
            setServerError(msg);
            toast.error(msg);
        }
    };

    const handleCancel = () => {
        reset({ name: user?.name ?? "", email: user?.email ?? "" });
        setServerError(null);
        setIsEditing(false);
    };

    return {
        user,
        isEditing,
        setIsEditing,
        serverError,
        userRole,
        register,
        handleSubmit: handleSubmit(onSubmit),
        handleCancel,
        errors,
        isSubmitting,
    };
}
