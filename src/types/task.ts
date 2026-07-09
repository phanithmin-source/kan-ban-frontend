import type { TaskQuery, TaskStatus, TaskPriority } from "../gql/graphql";

export type { TaskStatus, TaskPriority };

export type Task = NonNullable<TaskQuery["task"]>;
