import type { BoardQuery, TaskStatus, TaskPriority } from "../gql/graphql";

export type { TaskStatus, TaskPriority };

export type Task = NonNullable<BoardQuery["board"]>["tasks"][number];
