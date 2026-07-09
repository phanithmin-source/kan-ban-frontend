import type { TaskQuery, TaskStatus, TaskPriority } from "../gql/graphql";

export type { TaskStatus, TaskPriority };

export type Task = Omit<NonNullable<TaskQuery["task"]>, "comments" | "creator"> & {
    creator: {
        id: string;
        name: string;
        email?: string | null;
    };
    comments?: NonNullable<TaskQuery["task"]>["comments"] | null;
};
